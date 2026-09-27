import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clipboard, Clock3, Crown, Heart, Image as ImageIcon, Lightbulb, LoaderCircle, Swords, Trophy, UsersRound, Wifi, X, Zap } from 'lucide-react';
import { Peer, type DataConnection } from 'peerjs';
import { games, steamAppIds, type Game } from './games';
import { localizeGame } from './game-localization';
import { AutoTranslate, useI18n } from './i18n';
import { defaultAvatar, type AvatarId } from './avatars';
import './battle.css';

type Round = { game: Game; choices: Game[] };
type Player = string;
type RoomPlayer = { id: Player; name: string; avatar: AvatarId; connected: boolean };
type RoomType = 'duel' | 'group';
type DuelMode = 'emoji' | 'clues' | 'features' | 'image';
type DuelSettings = { mode: DuelMode; timeLimitSeconds: number | null; battleMode: boolean };
type BattleEvent = { attacker: Player | null; defender: Player | null; damage: number; multiplier: number; advantageSeconds: number; forfeit?: boolean };
type DuelSnapshot = {
  rounds: Round[];
  roundIndex: number;
  settings: DuelSettings;
  roomType: RoomType;
  startedAt: number;
  endedAt: number | null;
  players: RoomPlayer[];
  scores: Record<Player, number>;
  answers: Record<Player, string | null>;
  answerTimes: Record<Player, number | null>;
  health: Record<Player, number>;
  hitStreaks: Record<Player, number>;
  battleEvent: BattleEvent | null;
  finished: boolean;
};
type DuelMessage =
  | { type: 'join'; name: string; avatar: AvatarId }
  | { type: 'joined'; players: RoomPlayer[]; roomType: RoomType }
  | { type: 'roomUpdate'; players: RoomPlayer[] }
  | { type: 'closed' }
  | { type: 'full' }
  | { type: 'start'; snapshot: DuelSnapshot }
  | { type: 'state'; snapshot: DuelSnapshot }
  | { type: 'answer'; title: string };
type Props = { ownerUid?: string; ownerName: string; ownerAvatar: AvatarId; premium: boolean; onOpenPremium: () => void; onExit: () => void };

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const TIMEOUT_ANSWER = '__TIMEOUT__';
const DISCONNECTED_ANSWER = '__DISCONNECTED__';
const duelModes: Array<{ id: DuelMode; icon: string; title: string; detail: string }> = [
  { id: 'emoji', icon: '🎭', title: 'Emojik', detail: 'Emoji + egy nyom' },
  { id: 'clues', icon: '🕵️', title: 'Nyomok', detail: 'Történet + tipp' },
  { id: 'features', icon: '🧩', title: 'Jellemzők', detail: 'Játékmenet + tipp' },
  { id: 'image', icon: '🖼️', title: 'Képfelismerő', detail: 'A kép idővel élesedik' },
];

function shuffle<T,>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function createDuelRounds(mode: DuelMode, roundLimit: number): Round[] {
  const deck = mode === 'image' ? games.filter((game) => steamAppIds[game.title] !== undefined) : games;
  return shuffle(deck).slice(0, Math.min(roundLimit, deck.length)).map((game) => ({
    game,
    choices: shuffle([game, ...shuffle(games.filter((item) => item.title !== game.title)).slice(0, 3)]),
  }));
}

function makeRoomCode(): string {
  return Array.from({ length: 6 }, () => ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)]).join('');
}

function makeInitialSnapshot(settings: DuelSettings, players: RoomPlayer[], roomType: RoomType, roundLimit: number): DuelSnapshot {
  const scores = Object.fromEntries(players.map((player) => [player.id, 0])) as Record<Player, number>;
  const answers = Object.fromEntries(players.map((player) => [player.id, null])) as Record<Player, string | null>;
  const answerTimes = Object.fromEntries(players.map((player) => [player.id, null])) as Record<Player, number | null>;
  const health = Object.fromEntries(players.map((player) => [player.id, 1000])) as Record<Player, number>;
  const hitStreaks = Object.fromEntries(players.map((player) => [player.id, 0])) as Record<Player, number>;
  return {
    rounds: createDuelRounds(settings.mode, roundLimit),
    roundIndex: 0,
    settings,
    roomType,
    startedAt: Date.now(),
    endedAt: null,
    players,
    scores,
    answers,
    answerTimes,
    health,
    hitStreaks,
    battleEvent: null,
    finished: false,
  };
}

function normalizePlayers(players: RoomPlayer[]): RoomPlayer[] {
  return players.map((player) => ({ ...player, avatar: player.avatar ?? defaultAvatar }));
}

function normalizeSnapshot(snapshot: DuelSnapshot): DuelSnapshot {
  const players = normalizePlayers(snapshot.players);
  return {
    ...snapshot,
    players,
    settings: { ...snapshot.settings, battleMode: snapshot.settings.battleMode ?? false },
    answerTimes: snapshot.answerTimes ?? Object.fromEntries(players.map((player) => [player.id, null])) as Record<Player, number | null>,
    health: snapshot.health ?? Object.fromEntries(players.map((player) => [player.id, 1000])) as Record<Player, number>,
    hitStreaks: snapshot.hitStreaks ?? Object.fromEntries(players.map((player) => [player.id, 0])) as Record<Player, number>,
    battleEvent: snapshot.battleEvent ?? null,
  };
}

function describeBattleEvent(snapshot: DuelSnapshot, language: 'hu' | 'en'): string {
  const event = snapshot.battleEvent;
  if (!event?.attacker || !event.defender) {
    return language === 'en'
      ? 'No damage this round — answer faster or get it right first next time!'
      : 'Ebben a körben nem volt sebzés — válaszolj gyorsabban, vagy találd el elsőként!';
  }
  const attacker = snapshot.players.find((player) => player.id === event.attacker)?.name ?? '';
  const defender = snapshot.players.find((player) => player.id === event.defender)?.name ?? '';
  if (event.forfeit) {
    return language === 'en' ? `${defender} left the battle. ${attacker} wins by forfeit.` : `${defender} kilépett a csatából. ${attacker} feladással nyert.`;
  }
  return language === 'en'
    ? `${attacker} dealt ${event.damage} damage to ${defender} (${event.multiplier.toFixed(1)}× combo, ${event.advantageSeconds.toFixed(1)}s faster).`
    : `${attacker} ${event.damage} sebzést okozott ${defender} játékosnak (${event.multiplier.toFixed(1)}× szorzó, ${event.advantageSeconds.toFixed(1)} mp előny).`;
}

function friendlyPeerError(type: string): string {
  if (type === 'unavailable-id') return 'Ez a szobakód már foglalt. Hozz létre egy új szobát.';
  if (type === 'peer-unavailable') return 'Nem található a szoba. Ellenőrizd a kódot, és próbáld újra.';
  if (type === 'browser-incompatible') return 'Ez a böngésző nem támogatja a valós idejű párbajt.';
  if (type === 'network' || type === 'socket-error' || type === 'server-error') return 'A kapcsolatszerver nem érhető el. Ellenőrizd az internetkapcsolatot, majd próbáld újra.';
  return 'Nem sikerült létrehozni a kapcsolatot. Próbáld újra.';
}

function makePeerOptions() {
  return { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] } };
}

function DuelRoom({ ownerUid, ownerName, ownerAvatar, premium, onOpenPremium, onExit }: Props) {
  const { language } = useI18n();
  const [stage, setStage] = useState<'setup' | 'room' | 'playing'>('setup');
  const [playerName, setPlayerName] = useState(language === 'en' ? 'Player' : 'Játékos');
  const [codeInput, setCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('duel');
  const [role, setRole] = useState<Player | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const [selectedMode, setSelectedMode] = useState<DuelMode>('emoji');
  const [timedDuel, setTimedDuel] = useState(false);
  const [battleMode, setBattleMode] = useState(false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(30);
  const [roundLimit, setRoundLimit] = useState(10);
  const [clockNow, setClockNow] = useState(Date.now());
  const [status, setStatus] = useState('Hozz létre szobát, vagy csatlakozz egy meglévőhöz.');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [snapshot, setSnapshot] = useState<DuelSnapshot | null>(null);
  const [pendingAnswer, setPendingAnswer] = useState(false);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const peerRef = useRef<Peer | null>(null);
  const connectionRef = useRef<DataConnection | null>(null);
  const connectionsRef = useRef<Map<Player, DataConnection>>(new Map());
  const roomPlayersRef = useRef<RoomPlayer[]>([]);
  const roomStartedRef = useRef(false);
  const snapshotRef = useRef<DuelSnapshot | null>(null);
  const liveSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    setPlayerName((current) => current === 'Játékos' || current === 'Player' ? language === 'en' ? 'Player' : 'Játékos' : current);
  }, [language]);

  useEffect(() => () => {
    connectionRef.current?.close();
    peerRef.current?.destroy();
    const liveSessionId = liveSessionIdRef.current;
    if (ownerUid && liveSessionId) {
      void import('./firebase-store').then(({ clearLiveGame }) => clearLiveGame(ownerUid, liveSessionId)).catch(() => undefined);
    }
  }, [ownerUid]);

  function publishLiveSnapshot(current: DuelSnapshot) {
    if (!ownerUid || !liveSessionIdRef.current || current.finished) return;
    const currentRound = current.rounds[current.roundIndex];
    if (!currentRound) return;
    const scores = Object.fromEntries(current.players.map((player) => [player.name, current.scores[player.id] ?? 0]));
    void import('./firebase-store').then(({ publishLiveGame }) => publishLiveGame(liveSessionIdRef.current!, {
      ownerUid,
      playerName: ownerName,
      kind: 'multiplayer',
      mode: duelModes.find((item) => item.id === current.settings.mode)?.title ?? current.settings.mode,
      roundIndex: current.roundIndex,
      totalRounds: current.rounds.length,
      solution: currentRound.game.title,
      roomCode,
      roomType: current.roomType,
      players: current.players.map((player) => player.name),
      scores,
    })).catch(() => undefined);
  }

  function updateSnapshot(next: DuelSnapshot, sendToGuest = false) {
    snapshotRef.current = next;
    setSnapshot(next);
    publishLiveSnapshot(next);
    if (next.finished && liveSessionIdRef.current) {
      const liveSessionId = liveSessionIdRef.current;
      liveSessionIdRef.current = null;
      if (ownerUid) {
        void import('./firebase-store').then(({ clearLiveGame }) => clearLiveGame(ownerUid, liveSessionId)).catch(() => undefined);
      }
    }
    if (sendToGuest) {
      connectionsRef.current.forEach((connection) => {
        if (connection.open) connection.send({ type: 'state', snapshot: next } satisfies DuelMessage);
      });
    }
  }

  function updateRoomPlayers(next: RoomPlayer[], notifyGuests = false) {
    roomPlayersRef.current = next;
    setRoomPlayers(next);
    if (notifyGuests) {
      connectionsRef.current.forEach((connection) => {
        if (connection.open) connection.send({ type: 'roomUpdate', players: next } satisfies DuelMessage);
      });
    }
  }

  function receiveAnswer(player: Player, title: string) {
    const current = snapshotRef.current;
    if (!current || current.finished || current.answers[player] !== null || !current.players.some((member) => member.id === player)) return;
    const receivedAt = Date.now();
    if (current.settings.timeLimitSeconds && receivedAt >= current.startedAt + current.settings.timeLimitSeconds * 1000 && title !== TIMEOUT_ANSWER) {
      title = TIMEOUT_ANSWER;
    }
    const answerIsCorrect = current.rounds[current.roundIndex]?.game.title === title;
    const answerAt = title === TIMEOUT_ANSWER && current.settings.timeLimitSeconds
      ? current.startedAt + current.settings.timeLimitSeconds * 1000
      : receivedAt;
    const elapsedSeconds = Math.max(0, (answerAt - current.startedAt) / 1000);
    const answers = { ...current.answers, [player]: title };
    const answerTimes = { ...current.answerTimes, [player]: answerAt };
    const roundComplete = current.players.every((member) => answers[member.id] !== null);
    const earned = answerIsCorrect
      ? current.settings.timeLimitSeconds
        ? Math.max(10, Math.round(100 * (1 - (elapsedSeconds / current.settings.timeLimitSeconds) * 0.75)))
        : 100
      : 0;
    const health = { ...current.health };
    const hitStreaks = { ...current.hitStreaks };
    let battleEvent: BattleEvent | null = current.battleEvent;
    let finished: boolean = current.finished;
    if (current.settings.battleMode && roundComplete) {
      const disconnectedPlayer = current.players.find((member) => answers[member.id] === DISCONNECTED_ANSWER);
      if (disconnectedPlayer) {
        const opponent = current.players.find((member) => member.id !== disconnectedPlayer.id);
        health[disconnectedPlayer.id] = 0;
        if (opponent) {
          hitStreaks[disconnectedPlayer.id] = 0;
          battleEvent = { attacker: opponent.id, defender: disconnectedPlayer.id, damage: current.health[disconnectedPlayer.id] ?? 1000, multiplier: 1, advantageSeconds: 0, forfeit: true };
        }
        finished = true;
      } else {
        const correctPlayers = current.players.filter((member) => answers[member.id] === current.rounds[current.roundIndex]?.game.title);
        let attacker: Player | null = null;
        let defender: Player | null = null;
        if (correctPlayers.length === 2) {
          const [first, second] = correctPlayers;
          if ((answerTimes[first.id] ?? Infinity) < (answerTimes[second.id] ?? Infinity)) {
            attacker = first.id;
            defender = second.id;
          } else if ((answerTimes[second.id] ?? Infinity) < (answerTimes[first.id] ?? Infinity)) {
            attacker = second.id;
            defender = first.id;
          }
        } else if (correctPlayers.length === 1) {
          const correctPlayer = correctPlayers[0];
          const opponent = current.players.find((member) => member.id !== correctPlayer.id);
          if (opponent && (answerTimes[correctPlayer.id] ?? Infinity) < (answerTimes[opponent.id] ?? Infinity)) {
            attacker = correctPlayer.id;
            defender = opponent.id;
          }
        }

        if (attacker && defender) {
          const advantageSeconds = Math.max(0, ((answerTimes[defender] ?? answerAt) - (answerTimes[attacker] ?? answerAt)) / 1000);
          const timeLimit = current.settings.timeLimitSeconds ?? 30;
          const baseDamage = Math.round(50 + 450 * Math.min(1, advantageSeconds / timeLimit));
          const multiplier = Math.min(3, 1 + (hitStreaks[attacker] ?? 0) * 0.5);
          const damage = Math.round(baseDamage * multiplier);
          health[defender] = Math.max(0, (health[defender] ?? 1000) - damage);
          hitStreaks[attacker] = (hitStreaks[attacker] ?? 0) + 1;
          hitStreaks[defender] = 0;
          battleEvent = { attacker, defender, damage, multiplier, advantageSeconds };
          finished = health[defender] === 0;
        } else {
          current.players.forEach((member) => { hitStreaks[member.id] = 0; });
          battleEvent = { attacker: null, defender: null, damage: 0, multiplier: 1, advantageSeconds: 0 };
        }
      }
    }
    const next: DuelSnapshot = {
      ...current,
      answers,
      answerTimes,
      endedAt: roundComplete ? receivedAt : null,
      health,
      hitStreaks,
      battleEvent,
      finished,
      scores: {
        ...current.scores,
        [player]: current.scores[player] + earned,
      },
    };
    updateSnapshot(next, true);
  }

  function attachConnection(connection: DataConnection, isHost: boolean, name: string) {
    if (isHost) connectionsRef.current.set(connection.peer, connection);
    else connectionRef.current = connection;
    connection.on('open', () => {
      setError('');
      if (isHost) {
        setStatus('Új játékos csatlakozik a szobához…');
      } else {
        setStatus('Kapcsolódva a szobához. Várakozás a házigazdára…');
        connection.send({ type: 'join', name, avatar: ownerAvatar } satisfies DuelMessage);
      }
    });
    connection.on('data', (raw) => {
      const message = raw as DuelMessage;
      if (isHost) {
        if (message.type === 'join') {
          if (roomStartedRef.current) {
            connection.send({ type: 'closed' } satisfies DuelMessage);
            connection.close();
            return;
          }
          if (roomType === 'duel' && roomPlayersRef.current.filter((player) => player.connected).length >= 2) {
            connection.send({ type: 'full' } satisfies DuelMessage);
            connection.close();
            return;
          }
          const joiningPlayer = { id: connection.peer, name: message.name || 'Játékos', avatar: message.avatar || defaultAvatar, connected: true };
          const nextPlayers = [...roomPlayersRef.current.filter((player) => player.id !== connection.peer), joiningPlayer];
          updateRoomPlayers(nextPlayers, true);
          connection.send({ type: 'joined', players: nextPlayers, roomType } satisfies DuelMessage);
          setStatus(`${nextPlayers.length - 1} játékos csatlakozott. ${roomType === 'group' ? 'Továbbiak is jöhetnek!' : 'Indíthatod a párbajt!'}`);
        } else if (message.type === 'answer') {
          receiveAnswer(connection.peer, message.title);
        }
        return;
      }
      if (message.type === 'joined') {
        updateRoomPlayers(normalizePlayers(message.players));
        setRoomType(message.roomType);
        setStatus('Csatlakoztál. Várj, amíg a házigazda elindítja a párbajt.');
      } else if (message.type === 'roomUpdate') {
        updateRoomPlayers(normalizePlayers(message.players));
      } else if (message.type === 'start') {
        const normalized = normalizeSnapshot(message.snapshot);
        snapshotRef.current = normalized;
        setSnapshot(normalized);
        setPendingAnswer(false);
        setStage('playing');
      } else if (message.type === 'state') {
        const normalized = normalizeSnapshot(message.snapshot);
        snapshotRef.current = normalized;
        setSnapshot(normalized);
        setPendingAnswer(false);
        if (message.snapshot.finished) setStatus('A párbaj véget ért.');
      } else if (message.type === 'closed') {
        setError('A játék már elindult, ezért új játékost már nem lehet felvenni.');
      } else if (message.type === 'full') {
        setError('Ez a párbajszoba már megtelt. Kérj kódot a csoportszobához, vagy indítsatok új párbajt.');
      }
    });
    connection.on('close', () => {
      if (isHost) {
        connectionsRef.current.delete(connection.peer);
        if (roomStartedRef.current) {
          updateRoomPlayers(roomPlayersRef.current.map((player) => player.id === connection.peer ? { ...player, connected: false } : player), true);
          const current = snapshotRef.current;
          if (current) {
            const updated = { ...current, players: current.players.map((player) => player.id === connection.peer ? { ...player, connected: false } : player) };
            updateSnapshot(updated, true);
          }
          receiveAnswer(connection.peer, DISCONNECTED_ANSWER);
        } else {
          updateRoomPlayers(roomPlayersRef.current.filter((player) => player.id !== connection.peer), true);
        }
        setStatus(`${Math.max(0, roomPlayersRef.current.filter((player) => player.id !== 'host' && player.connected).length)} játékos van a szobában.`);
      } else {
        connectionRef.current = null;
        setStatus('A házigazda kapcsolata megszakadt.');
      }
    });
    connection.on('error', () => setError('A játékosok közötti kapcsolat megszakadt.'));
  }

  function attachPeerErrors(peer: Peer) {
    peer.on('error', (peerError) => setError(friendlyPeerError(peerError.type)));
    peer.on('disconnected', () => setStatus('Újracsatlakozás a szobaszolgáltatáshoz…'));
  }

  function createRoom() {
    const name = playerName.trim() || 'Játékos';
    setPlayerName(name);
    setError('');
    setRole('host');
    roomStartedRef.current = false;
    connectionsRef.current.clear();
    updateRoomPlayers([{ id: 'host', name, avatar: ownerAvatar, connected: true }]);
    const code = makeRoomCode();
    setRoomCode(code);
    setStage('room');
    setStatus('A szoba létrehozása folyamatban…');

    const peer = new Peer(`gg-${code.toLowerCase()}`, makePeerOptions());
    peerRef.current = peer;
    attachPeerErrors(peer);
    peer.on('open', () => setStatus('A szoba nyitva van. Küldd el a kódot a barátaidnak!'));
    peer.on('connection', (connection) => {
      if (connectionsRef.current.has(connection.peer)) {
        connection.close();
        return;
      }
      attachConnection(connection, true, name);
    });
  }

  function joinRoom() {
    const code = codeInput.trim().toUpperCase();
    if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) {
      setError('A szobakód 6 betűből vagy számból áll.');
      return;
    }
    const name = playerName.trim() || 'Játékos';
    setPlayerName(name);
    setError('');
    roomStartedRef.current = false;
    setRoomCode(code);
    setStage('room');
    setStatus('Kapcsolódás a szobához…');

    const peer = new Peer(`gg-player-${Math.random().toString(36).slice(2, 10)}`, makePeerOptions());
    peerRef.current = peer;
    setRole(peer.id);
    updateRoomPlayers([{ id: peer.id, name, avatar: ownerAvatar, connected: true }]);
    attachPeerErrors(peer);
    peer.on('open', () => {
      const connection = peer.connect(`gg-${code.toLowerCase()}`, { reliable: true });
      attachConnection(connection, false, name);
    });
  }

  function startDuel() {
    const connectedPlayers = roomPlayersRef.current.filter((player) => player.connected);
    if (role !== 'host' || connectedPlayers.length < 2) return;
    const settings: DuelSettings = { mode: selectedMode, timeLimitSeconds: timedDuel || battleMode ? timeLimitSeconds : null, battleMode };
    const initial = makeInitialSnapshot(settings, connectedPlayers, roomType, premium ? roundLimit : 10);
    snapshotRef.current = initial;
    setSnapshot(initial);
    liveSessionIdRef.current = crypto.randomUUID();
    publishLiveSnapshot(initial);
    roomStartedRef.current = true;
    setStage('playing');
    setStatus('A párbaj elindult!');
    connectionsRef.current.forEach((connection) => {
      if (connection.open) connection.send({ type: 'start', snapshot: initial } satisfies DuelMessage);
    });
  }

  function chooseAnswer(title: string) {
    if (!role || !snapshot || snapshot.answers[role] !== null || pendingAnswer || (timeLimit && secondsRemaining === 0)) return;
    if (role === 'host') {
      receiveAnswer('host', title);
    } else {
      setPendingAnswer(true);
      connectionRef.current?.send({ type: 'answer', title } satisfies DuelMessage);
    }
  }

  function advanceRound() {
    if (role !== 'host' || !snapshot || !snapshot.players.every((player) => snapshot.answers[player.id] !== null)) return;
    if (snapshot.roundIndex >= snapshot.rounds.length - 1) {
      updateSnapshot({ ...snapshot, finished: true }, true);
      setStatus('A párbaj véget ért.');
      return;
    }
    const nextPlayers = snapshot.players.filter((player) => player.connected);
    updateSnapshot({
      ...snapshot,
      roundIndex: snapshot.roundIndex + 1,
      startedAt: Date.now(),
      endedAt: null,
      answers: Object.fromEntries(nextPlayers.map((player) => [player.id, null])) as Record<Player, string | null>,
      answerTimes: Object.fromEntries(nextPlayers.map((player) => [player.id, null])) as Record<Player, number | null>,
      players: nextPlayers,
      scores: Object.fromEntries(nextPlayers.map((player) => [player.id, snapshot.scores[player.id]])) as Record<Player, number>,
      health: Object.fromEntries(nextPlayers.map((player) => [player.id, snapshot.health[player.id] ?? 1000])) as Record<Player, number>,
      hitStreaks: Object.fromEntries(nextPlayers.map((player) => [player.id, snapshot.hitStreaks[player.id] ?? 0])) as Record<Player, number>,
      battleEvent: null,
    }, true);
    setImageUnavailable(false);
  }

  async function copyRoomCode() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Nem sikerült másolni. Jelöld ki és másold ki a szobakódot kézzel.');
    }
  }

  const storedRound = snapshot?.rounds[snapshot.roundIndex];
  const currentRound = storedRound ? { ...storedRound, game: localizeGame(storedRound.game, language) } : undefined;
  const roundComplete = !!snapshot && snapshot.players.every((player) => snapshot.answers[player.id] !== null);
  const myAnswer = role && snapshot ? snapshot.answers[role] : null;
  const sortedPlayers = snapshot ? [...snapshot.players].sort((left, right) => snapshot.settings.battleMode
    ? (snapshot.health[right.id] ?? 1000) - (snapshot.health[left.id] ?? 1000)
    : (snapshot.scores[right.id] ?? 0) - (snapshot.scores[left.id] ?? 0)) : [];
  const winningMetric = sortedPlayers[0] && snapshot
    ? snapshot.settings.battleMode ? snapshot.health[sortedPlayers[0].id] ?? 1000 : snapshot.scores[sortedPlayers[0].id] ?? 0
    : 0;
  const tiedPlayers = snapshot ? sortedPlayers.filter((player) => (snapshot.settings.battleMode
    ? snapshot.health[player.id] ?? 1000
    : snapshot.scores[player.id] ?? 0) === winningMetric) : [];
  const timeLimit = snapshot?.settings.timeLimitSeconds ?? null;
  const timerTimestamp = roundComplete && snapshot?.endedAt !== null && snapshot?.endedAt !== undefined ? snapshot.endedAt : clockNow;
  const secondsRemaining = timeLimit && snapshot
    ? Math.max(0, Math.ceil((snapshot.startedAt + timeLimit * 1000 - timerTimestamp) / 1000))
    : null;
  const timerProgress = timeLimit && snapshot
    ? roundComplete ? 1 : Math.min(1, Math.max(0, (clockNow - snapshot.startedAt) / (timeLimit * 1000)))
    : 0;

  useEffect(() => {
    if (!snapshot || stage !== 'playing' || !snapshot.settings.timeLimitSeconds || snapshot.finished || roundComplete) return;
    const tick = () => setClockNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 150);
    return () => window.clearInterval(interval);
  }, [snapshot?.startedAt, snapshot?.settings.timeLimitSeconds, snapshot?.finished, snapshot?.answers, stage, roundComplete]);

  useEffect(() => {
    if (role !== 'host' || !snapshot || !snapshot.settings.timeLimitSeconds || snapshot.finished || secondsRemaining !== 0) return;
    snapshot.players.forEach((player) => {
      if (snapshot.answers[player.id] === null) receiveAnswer(player.id, TIMEOUT_ANSWER);
    });
  }, [role, snapshot?.startedAt, snapshot?.settings.timeLimitSeconds, snapshot?.finished, snapshot?.answers, secondsRemaining]);

  useEffect(() => {
    if (stage === 'playing' && snapshot && !snapshot.finished) {
      setImageUnavailable(false);
    }
  }, [stage, snapshot?.roundIndex]);

  useEffect(() => {
    if (role !== 'host' || stage !== 'playing' || !snapshot || snapshot.finished || !ownerUid || !liveSessionIdRef.current) return;
    const heartbeat = window.setInterval(() => {
      const current = snapshotRef.current;
      if (current) publishLiveSnapshot(current);
    }, 25_000);
    return () => window.clearInterval(heartbeat);
  }, [role, stage, snapshot?.roundIndex, snapshot?.finished, ownerUid, roomCode]);

  return (
    <AutoTranslate>
    <section className="duel-page">
      <div className="duel-topbar">
        <button className="back-button" onClick={onExit}><ArrowLeft size={17} /> Vissza a főoldalra</button>
        <div className="duel-brand"><span><Swords size={17} /></span> GAMEGUESSER <b>DUEL</b></div>
        <span className="duel-online"><Wifi size={14} /> ONLINE</span>
      </div>

      {stage === 'setup' && <>
        <div className="duel-intro">
          <span className="section-kicker">HÍVD KI A BARÁTAIDAT</span>
          <h1>Ki ismeri jobban<br /><span>a játékokat?</span></h1>
          <p>Hozzatok létre egy szobát, osszátok meg a kódot, és küzdjetek meg játékfelismerő kérdésekben baráti társaságban!</p>
          <div className="duel-feature-tags"><span><UsersRound size={14} /> Tetszőleges létszám</span><span><Trophy size={14} /> 10 kérdés · Premium: 20</span><span><Wifi size={14} /> Valós idejű</span></div>
        </div>
        <div className="duel-setup-grid">
          <article className="duel-lobby-card host-card">
            <div className="lobby-icon host-icon"><Crown size={23} /></div>
            <span className="lobby-step">01 · HÁZIGAZDA</span>
            <h2>Szoba létrehozása</h2>
            <p>Indíts egy közös játékot, majd küldd el a szobakódot az egész társaságnak.</p>
            <div className="room-type-picker" role="group" aria-label="Szobatípus">
              <button className={`room-type-choice ${roomType === 'duel' ? 'selected' : ''}`} onClick={() => setRoomType('duel')} aria-pressed={roomType === 'duel'}><Swords size={16} /><span><strong>Párbaj</strong><small>Te + 1 ellenfél</small></span></button>
              <button className={`room-type-choice ${roomType === 'group' ? 'selected' : ''}`} onClick={() => { setRoomType('group'); setBattleMode(false); }} aria-pressed={roomType === 'group'}><UsersRound size={16} /><span><strong>Csoportszoba</strong><small>Korlátlan létszám</small></span></button>
            </div>
            <label className="duel-input-label">Játékosnév<input value={playerName} maxLength={18} onChange={(event) => setPlayerName(event.target.value)} placeholder="Add meg a neved" /></label>
            <button className="primary-button duel-action" onClick={createRoom} disabled={!!peerRef.current}>{roomType === 'group' ? 'Csoportszobát hozok létre' : 'Párbajszobát hozok létre'} <ArrowRight size={17} /></button>
          </article>
          <div className="duel-or"><span>VAGY</span></div>
          <article className="duel-lobby-card join-card">
            <div className="lobby-icon join-icon"><UsersRound size={23} /></div>
            <span className="lobby-step">02 · CSATLAKOZÁS</span>
            <h2>Csatlakozás kóddal</h2>
            <p>Kérd el a szobakódot a házigazdától, és csatlakozz a közös játékhoz.</p>
            <label className="duel-input-label">Játékosnév<input value={playerName} maxLength={18} onChange={(event) => setPlayerName(event.target.value)} placeholder="Add meg a neved" /></label>
            <label className="duel-input-label room-code-input-label">Szobakód<input value={codeInput} maxLength={6} onChange={(event) => setCodeInput(event.target.value.toUpperCase())} placeholder="PL. K7M4TX" autoComplete="off" /></label>
            <button className="secondary-button duel-action" onClick={joinRoom} disabled={!!peerRef.current}>Csatlakozás <ArrowRight size={16} /></button>
          </article>
        </div>
      </>}

      {stage === 'room' && <div className={`duel-room-card ${role === 'host' ? 'host-room-card' : ''}`}>
        <div className="room-card-glow" />
        <span className="section-kicker">{role === 'host' ? roomType === 'group' ? 'NYITOTT CSOPORTSZOBA' : 'KÉTFŐS PÁRBAJ' : 'CSATLAKOZÁS A SZOBÁHOZ'}</span>
        <h1>{role === 'host' ? roomType === 'group' ? 'Hívd meg az egész társaságot!' : 'Hívd meg az ellenfeled!' : 'Már majdnem kész!'}</h1>
        <p className="room-description">{role === 'host' ? roomType === 'group' ? 'Oszd meg a szobakódot — korlátlan számú barát csatlakozhat a játék indítása előtt.' : 'Oszd meg a szobakódot egy barátoddal, és indulhat a párbaj.' : 'Várj, amíg a házigazda elindítja a közös játékot.'}</p>
        <div className="room-code-display"><span>SZOBAKÓD</span><strong>{roomCode}</strong>{role === 'host' && <button onClick={copyRoomCode} aria-label="Szobakód másolása"><Clipboard size={17} /> {copied ? 'Másolva!' : 'Másolás'}</button>}</div>
        <div className="room-players-multiplayer">
          <div className="room-player-list-heading"><strong><UsersRound size={14} /> Játékosok a szobában</strong><span>{roomPlayers.filter((player) => player.connected).length} csatlakozott{roomType === 'duel' ? ' / 2' : ''}</span></div>
          <div className="room-player-list">{roomPlayers.map((player) => <div className={`room-player-row ${player.connected ? 'player-ready' : 'player-waiting'}`} key={player.id}>
            <span className="room-player-avatar">{player.avatar}</span>
            <span className="room-player-name"><strong>{player.name}{player.id === role ? ' (te)' : ''}</strong><small>{player.id === 'host' ? 'HÁZIGAZDA' : player.connected ? 'CSATLAKOZOTT' : 'KILÉPETT'}</small></span>
            <i className="room-player-status" />
          </div>)}
          </div>
        </div>
        {role === 'host' ? <div className="duel-room-settings">
          <div className="duel-settings-title"><span>HÁZIGAZDAI BEÁLLÍTÁSOK</span><small>A játék indulásáig módosíthatók</small></div>
          <span className="duel-setting-label">Játékmód</span>
          <div className="duel-mode-picker" role="group" aria-label="Párbaj játékmódja">
            {duelModes.map((item) => <button key={item.id} className={`duel-mode-choice ${selectedMode === item.id ? 'selected' : ''}`} onClick={() => setSelectedMode(item.id)} aria-pressed={selectedMode === item.id}>
              <span>{item.icon}</span><strong>{item.title}</strong><small>{item.detail}</small>
            </button>)}
          </div>
          {roomType === 'duel' && <button type="button" className={`battle-toggle ${battleMode ? 'enabled' : ''}`} onClick={() => { const next = !battleMode; setBattleMode(next); if (next) setTimedDuel(true); }} aria-pressed={battleMode}>
            <span className="battle-toggle-icon"><Heart size={17} /></span>
            <span><strong>Életre menő csata</strong><small>1000 élet · a gyorsabb helyes válasz sebez · sorozat-szorzó</small></span>
            <i className="timer-switch" />
          </button>}
          <label className="duel-round-setting">Kérdések száma
            <select value={premium ? roundLimit : 10} onChange={(event) => setRoundLimit(Number(event.target.value))} disabled={!premium}>
              <option value={10}>10 kérdés</option>
              {premium && <option value={20}>20 kérdés · Premium maraton</option>}
            </select>
            {!premium && <button type="button" className="duel-premium-unlock" onClick={onOpenPremium}><Crown size={13} /> Premium · 20 kérdés</button>}
          </label>
          <div className="duel-timer-settings">
            <button className={`timer-toggle ${timedDuel ? 'enabled' : ''}`} onClick={() => setTimedDuel((current) => !current)} aria-pressed={timedDuel} disabled={battleMode}>
              <span className="timer-toggle-indicator"><Clock3 size={14} /></span>
              <span><strong>Időre menjen a párbaj</strong><small>{battleMode ? 'Csata módban az időmérő mindig aktív' : timedDuel ? 'A gyorsabb helyes válasz több pontot ér' : 'Kikapcsolva · nyugodt tempóban játszhattok'}</small></span>
              <i className="timer-switch" />
            </button>
            {timedDuel && <label className="timer-duration">Kérdésenként
              <select value={timeLimitSeconds} onChange={(event) => setTimeLimitSeconds(Number(event.target.value))}>
                {[15, 30, 45].map((seconds) => <option key={seconds} value={seconds}>{seconds} {language === 'en' ? 'sec' : 'mp'}</option>)}
              </select>
            </label>}
          </div>
          {timedDuel && selectedMode === 'image' && <div className="image-timer-explainer"><ImageIcon size={15} /> Az elmosódott kép a visszaszámlálás alatt fokozatosan kiélesedik.</div>}
        </div> : <div className="guest-settings-note"><Clock3 size={15} /> A házigazda beállítja a játékmódot és az időlimitet indítás előtt.</div>}
        <div className={`room-status ${roomPlayers.filter((player) => player.connected).length > 1 ? 'status-ready' : ''}`}><span className="status-pulse" />{status}</div>
        {role === 'host' ? <button className="primary-button duel-start" onClick={startDuel} disabled={roomPlayers.filter((player) => player.connected).length < 2}>{roomType === 'group' ? 'Csoportos játék indítása' : 'Párbaj indítása'} <Swords size={17} /></button> : <div className="waiting-callout"><LoaderCircle size={17} /> A házigazda indítására várunk</div>}
        <button className="text-button" onClick={onExit}>Kilépés a szobából</button>
      </div>}

      {stage === 'playing' && snapshot && currentRound && role && !snapshot.finished && <div className="duel-game">
        <div className="duel-game-top"><div className="duel-room-tag"><Swords size={15} /> {snapshot.roomType === 'group' ? 'CSOPORTSZOBA' : 'PÁRBAJ'} <span>·</span> {roomCode}<i>{snapshot.settings.battleMode ? 'ÉLETRE MENŐ CSATA' : duelModes.find((item) => item.id === snapshot.settings.mode)?.title}</i></div><span>({snapshot.roundIndex + 1}/{snapshot.rounds.length})</span></div>
        <div className={`duel-scoreboard ${snapshot.settings.battleMode ? 'battle-scoreboard' : ''}`}>
          {sortedPlayers.map((player) => {
            const health = Math.max(0, Math.min(1000, snapshot.health[player.id] ?? 1000));
            const hitStreak = snapshot.hitStreaks[player.id] ?? 0;
            const multiplier = Math.min(3, 1 + Math.max(0, hitStreak - 1) * 0.5);
            return <div className={`duel-score-player ${player.id === role ? 'you' : ''}`} key={player.id}><span className="duel-score-avatar">{player.avatar}</span><div><strong>{player.name} <small>{player.id === role ? 'TE' : player.id === 'host' ? 'HÁZIGAZDA' : ''}</small></strong>{snapshot.settings.battleMode ? <><span className="battle-health-label"><Heart size={12} /> {`${health} / 1000 ÉLET`}</span><div className="battle-health-track"><span style={{ width: `${health / 10}%` }} /></div><small className="battle-streak"><Zap size={11} /> {`${multiplier.toFixed(1)}× · ${hitStreak} találati sorozat`}</small></> : <span>{snapshot.scores[player.id] ?? 0} pont</span>}</div></div>;
          })}
        </div>
        {timeLimit && <div className={`duel-countdown ${secondsRemaining !== null && secondsRemaining <= 5 ? 'urgent' : ''}`}>
          <div className="countdown-caption"><span><Clock3 size={14} /> {roundComplete ? 'KÖR LEZÁRVA' : secondsRemaining === 0 ? 'LEJÁRT AZ IDŐ' : 'HÁTRALÉVŐ IDŐ'}</span><strong>{secondsRemaining ?? timeLimit}<small>{language === 'en' ? ' sec' : ' mp'}</small></strong></div>
          <div className="countdown-track"><span style={{ width: `${timerProgress * 100}%` }} /></div>
        </div>}
        <div className="duel-question-card">
          <div className="duel-question-meta"><span>KÉRDÉS {String(snapshot.roundIndex + 1).padStart(2, '0')}</span><span>{snapshot.settings.battleMode ? '⚔️ A GYORSABB TALÁLAT SEBEZ' : '🎮 KI ISMERI JOBBAN?'}</span></div>
          {snapshot.settings.mode === 'image' ? <div className="duel-image-frame">
            {!imageUnavailable && <img src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamAppIds[currentRound.game.title]}/header.jpg`} alt="Kitalálandó játékkép" style={{ filter: `blur(${timeLimit ? Math.max(0, 22 * (1 - timerProgress)) : 0}px)` }} onError={() => setImageUnavailable(true)} />}
            {imageUnavailable && <div className="duel-image-fallback" style={{ filter: `blur(${timeLimit ? Math.max(0, 22 * (1 - timerProgress)) : 0}px)` }} aria-hidden="true">{currentRound.game.emojis}</div>}
            <span>{roundComplete ? 'MEGFEJTÉS' : timeLimit ? 'A KÉP AZ IDŐVEL ÉLESEBB LESZ' : 'TALÁLD KI A JÁTÉKOT'}</span>
          </div> : snapshot.settings.mode === 'features' ? <div className="duel-feature-chips">{currentRound.game.features.map((feature) => <span key={feature}><Check size={13} /> {feature}</span>)}</div> : snapshot.settings.mode === 'clues' ? <div className="duel-clue duel-story-clue"><Lightbulb size={16} /> {currentRound.game.clues[0]}<br />{currentRound.game.clues[1]}</div> : <div className="duel-emojis">{currentRound.game.emojis}</div>}
          {(snapshot.settings.mode === 'emoji' || snapshot.settings.mode === 'image' || snapshot.settings.mode === 'clues') && <div className="duel-clue"><Lightbulb size={15} /> {snapshot.settings.mode === 'image' && timeLimit && timerProgress < .45 ? 'A félidőnél egy extra nyom is érkezik — figyeld, hogyan élesedik a kép!' : currentRound.game.clues[0]}</div>}
          <div className="duel-answers">
            {currentRound.choices.map((choice, index) => {
              const isCorrect = choice.title === currentRound.game.title;
              const myChoice = myAnswer === choice.title;
              const isWrongChoice = myChoice && !isCorrect;
              const answerClass = roundComplete && isCorrect ? 'correct' : isWrongChoice ? 'incorrect' : '';
              return <button key={choice.title} className={`answer-option ${answerClass}`} onClick={() => chooseAnswer(choice.title)} disabled={!!myAnswer || pendingAnswer || !!roundComplete || (timeLimit !== null && secondsRemaining === 0)}>
                <span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{choice.title}</span>
                {roundComplete && isCorrect && <Check size={17} className="answer-result-icon" />}
                {isWrongChoice && <X size={17} className="answer-result-icon" />}
              </button>;
            })}
          </div>
          {roundComplete ? <div className="duel-round-result">
            <div><strong>{currentRound.game.title}</strong><span>{snapshot.settings.battleMode ? describeBattleEvent(snapshot, language) : snapshot.players.map((player) => `${player.id === role ? 'Te' : player.name}: ${snapshot.answers[player.id] === TIMEOUT_ANSWER ? 'idő lejárt' : snapshot.answers[player.id] === DISCONNECTED_ANSWER ? 'kilépett' : snapshot.answers[player.id] === currentRound.game.title ? 'eltalálta' : 'nem találta el'}`).join(' · ')}</span></div>
            {role === 'host' ? <button className="primary-button" onClick={advanceRound}>{snapshot.roundIndex === snapshot.rounds.length - 1 ? 'Eredmény' : 'Következő kérdés'} <ArrowRight size={16} /></button> : <span className="waiting-next"><LoaderCircle size={15} /> Következő kérdésre várunk</span>}
          </div> : <div className="duel-waiting-status">{secondsRemaining === 0 ? <><Clock3 size={15} /> Lejárt az idő — az eredményre várunk</> : pendingAnswer || myAnswer ? <><LoaderCircle size={15} /> Tipp elküldve — {snapshot.players.filter((player) => player.id !== role && snapshot.answers[player.id] === null).length} játékos még válaszol</> : <><UsersRound size={15} /> A szobában lévő játékosok válaszára várunk</>}</div>}
        </div>
      </div>}

      {stage === 'playing' && snapshot?.finished && role && <div className="duel-result-card">
        <div className="duel-result-trophy">🏆</div><span className="section-kicker">PÁRBAJ VÉGE</span>
        <h1>{tiedPlayers.length > 1 ? 'Döntetlen!' : sortedPlayers[0]?.id === role ? 'Győztél!' : 'Végeredmény!'}</h1>
        <p>{snapshot.settings.battleMode ? language === 'en' ? `The battle ended after ${snapshot.roundIndex + 1} questions. Remaining health decides the winner.` : `A csata ${snapshot.roundIndex + 1} kérdés után ért véget. A megmaradt élet döntött.` : `Lejátszottátok mind a ${snapshot.rounds.length} kérdést. Íme a végső rangsor:`}</p>
        {snapshot.settings.battleMode && <div className="battle-final-event"><Zap size={15} /> {describeBattleEvent(snapshot, language)}</div>}
        <div className="duel-leaderboard">{sortedPlayers.map((player, index) => <div className={`duel-leader-row ${player.id === role ? 'you' : ''}`} key={player.id}><span className="leader-rank">{index + 1}.</span><strong>{player.name}{player.id === role ? ' (te)' : ''}</strong><span>{snapshot.settings.battleMode ? <><Heart size={13} /> {`${snapshot.health[player.id] ?? 1000} / 1000`}</> : `${snapshot.scores[player.id] ?? 0} pont`}</span>{index === 0 && <Crown size={16} />}</div>)}</div>
        <button className="primary-button" onClick={onExit}>Új párbaj indítása <ArrowRight size={17} /></button>
      </div>}

      {error && <div className="duel-error" role="alert"><X size={16} />{error}<button onClick={() => setError('')} aria-label="Hiba bezárása"><X size={14} /></button></div>}
      <footer className="duel-footer"><span>🔒 A válaszaitok közvetlenül egymás között utaznak.</span><span>Ingyenes, böngészőből böngészőbe kapcsolat</span></footer>
    </section>
    </AutoTranslate>
  );
}

export default DuelRoom;
