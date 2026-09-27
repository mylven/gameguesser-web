import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ArrowLeft, ArrowRight, Check, Crown, Flame, Gamepad2, Lightbulb, MessageCircle, Palette, Radio, RotateCcw, Sparkles, Swords, Trophy, UsersRound, X } from 'lucide-react';
import { categories, games, loadGameCatalog, refreshGameCatalog, steamAppIds, type Game, type GameCategory } from './games';
import { localizeGame } from './game-localization';
import { defaultAvatar, isAvatar, type AvatarId } from './avatars';
import { isThemeId, siteThemes, type ThemeId } from './themes';
import './discord.css';
import DuelRoom from './DuelRoom';
import AccountModal from './AccountModal';
import { auth, firebaseConfigured, hasAdminAccess, hasPendingPremiumRequest, hasPremiumAccess, loadCloudProfile, saveCloudProfile, type CloudProfile, type SavedProgress } from './firebase';
import { AutoTranslate, useI18n } from './i18n';

const AdminPanel = lazy(() => import('./AdminPanel'));
const LeaderboardPanel = lazy(() => import('./Leaderboard'));
const PremiumPanel = lazy(() => import('./PremiumPanel'));
const StreamerPanel = lazy(() => import('./StreamerPanel'));
const StreamerDirectory = lazy(() => import('./StreamerDirectory'));

type ModeId = 'emoji' | 'clues' | 'features' | 'image' | 'marathon' | 'survival';
type Screen = 'home' | 'playing' | 'complete' | 'duel' | 'admin' | 'leaderboard' | 'premium' | 'streamer' | 'streamer-directory';
type Stats = { gamesPlayed: number; questionsPlayed: number; correct: number; bestStreak: number; bestScore: number; totalScore: number };
type Round = { game: Game; choices: Game[] };
type GameProgress = { mode: ModeId; category: 'Mind' | GameCategory; rounds: Round[]; roundIndex: number; answer: string | null; wrongAnswers: string[]; revealedHints: number; score: number; streak: number; roundCorrect: number };

const modes: Array<{ id: ModeId; icon: string; title: string; detail: string; label: string; premium?: boolean }> = [
  { id: 'emoji', icon: '🎭', title: 'Emoji-kvíz', detail: 'Ismerd fel a játékot néhány beszédes emojiból.', label: 'Gyors és vicces' },
  { id: 'clues', icon: '🕵️', title: 'Nyomozó mód', detail: 'Fejtsd meg a játékot a fokozatosan felfedett nyomokból.', label: 'Gondolkodós' },
  { id: 'features', icon: '🧩', title: 'Jellemzők', detail: 'Műfaj és játékmenet alapján találd meg a helyes választ.', label: 'Igazi rajongóknak' },
  { id: 'image', icon: '🖼️', title: 'Képfelismerő', detail: 'Találd ki a játékot az elhomályosított képből.', label: 'Lásd meg a részleteket' },
  { id: 'marathon', icon: '🏁', title: 'Maraton Mix', detail: '20 kérdés, három játékmód váltakozva.', label: 'Premium · változatos', premium: true },
  { id: 'survival', icon: '❤️', title: 'Túlélő mód', detail: 'Válaszolj helyesen 20 kérdésre — egy hiba, és vége.', label: 'Premium · egy életed van', premium: true },
];

const defaultStats: Stats = { gamesPlayed: 0, questionsPlayed: 0, correct: 0, bestStreak: 0, bestScore: 0, totalScore: 0 };

function isGameProgress(value: unknown): value is GameProgress {
  if (!value || typeof value !== 'object') return false;
  const progress = value as Partial<GameProgress>;
  const supportedModes: ModeId[] = ['emoji', 'clues', 'features', 'image', 'marathon', 'survival'];
  return supportedModes.includes(progress.mode as ModeId)
    && ['Mind', ...categories.slice(1)].includes(progress.category as 'Mind' | GameCategory)
    && Array.isArray(progress.rounds)
    && progress.rounds.length > 0
    && progress.rounds.length <= 20
    && Number.isInteger(progress.roundIndex)
    && (progress.roundIndex ?? -1) >= 0
    && (progress.roundIndex ?? 11) < progress.rounds.length
    && progress.rounds.every((round) => !!round && typeof round.game?.title === 'string' && Array.isArray(round.choices) && round.choices.every((choice) => typeof choice?.title === 'string'))
    && Array.isArray(progress.wrongAnswers)
    && Number.isFinite(progress.score)
    && Number.isFinite(progress.revealedHints);
}

function loadLocalProfile(owner: string): CloudProfile {
  try {
    const saved = localStorage.getItem(`gameguesser-profile:${owner}`);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<CloudProfile>;
      return {
        stats: normalizeStats(parsed.stats),
        progress: isGameProgress(parsed.progress) ? parsed.progress : null,
        avatar: isAvatar(parsed.avatar) ? parsed.avatar : defaultAvatar,
      };
    }
    if (owner === 'guest') {
      const legacy = localStorage.getItem('gameguesser-stats');
      if (legacy) return { stats: normalizeStats(JSON.parse(legacy) as Partial<Stats>), progress: null };
    }
    return { stats: defaultStats, progress: null, avatar: defaultAvatar };
  } catch {
    return { stats: defaultStats, progress: null, avatar: defaultAvatar };
  }
}

function normalizeStats(value: Partial<Stats> | undefined): Stats {
  const source = value ?? {};
  return {
    gamesPlayed: Number.isFinite(source.gamesPlayed) ? Number(source.gamesPlayed) : 0,
    questionsPlayed: Number.isFinite(source.questionsPlayed) ? Number(source.questionsPlayed) : (source.gamesPlayed ?? 0) * 10,
    correct: Number.isFinite(source.correct) ? Number(source.correct) : 0,
    bestStreak: Number.isFinite(source.bestStreak) ? Number(source.bestStreak) : 0,
    bestScore: Number.isFinite(source.bestScore) ? Number(source.bestScore) : 0,
    totalScore: Number.isFinite(source.totalScore) ? Number(source.totalScore) : 0,
  };
}

function shuffle<T,>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createRounds(pool: Game[], count = 10): Round[] {
  const selected = shuffle(pool).slice(0, Math.min(count, pool.length));
  return selected.map((game) => {
    const distractors = shuffle(games.filter((candidate) => candidate.title !== game.title)).slice(0, 3);
    return { game, choices: shuffle([game, ...distractors]) };
  });
}

function App() {
  const { language, setLanguage } = useI18n();
  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<ModeId>('emoji');
  const [selectedRoundLimit, setSelectedRoundLimit] = useState(10);
  const [catalogSize, setCatalogSize] = useState(games.length);
  const [catalogReady, setCatalogReady] = useState(false);
  const [category, setCategory] = useState<'Mind' | GameCategory>('Mind');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [revealedHints, setRevealedHints] = useState(1);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [stats, setStats] = useState<Stats>(() => loadLocalProfile('guest').stats);
  const [avatar, setAvatar] = useState<AvatarId>(() => loadLocalProfile('guest').avatar ?? defaultAvatar);
  const [progress, setProgress] = useState<GameProgress | null>(() => {
    const saved = loadLocalProfile('guest').progress;
    return isGameProgress(saved) ? saved : null;
  });
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumRequestPending, setPremiumRequestPending] = useState(false);
  const [premiumRequestBusy, setPremiumRequestBusy] = useState(false);
  const [premiumRequestMessage, setPremiumRequestMessage] = useState('');
  const [streamerApproved, setStreamerApproved] = useState(false);
  const [streamerRequestPending, setStreamerRequestPending] = useState(false);
  const [authReady, setAuthReady] = useState(!auth);
  const [profileReady, setProfileReady] = useState(false);
  const [profileOwner, setProfileOwner] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'local' | 'loading' | 'saving' | 'saved' | 'offline'>('local');
  const [accountOpen, setAccountOpen] = useState(false);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const [premiumTheme, setPremiumTheme] = useState(() => localStorage.getItem('gameguesser-premium-theme') === 'true');
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const savedTheme = localStorage.getItem('gameguesser-theme');
    return isThemeId(savedTheme) ? savedTheme : 'arcade';
  });
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const themePickerRef = useRef<HTMLDivElement>(null);
  const hasProAccess = isPremium || streamerApproved;

  useEffect(() => {
    if (!themePickerOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !themePickerRef.current?.contains(event.target)) setThemePickerOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setThemePickerOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [themePickerOpen]);

  useEffect(() => {
    let active = true;
    let refreshTimer = 0;
    void loadGameCatalog().then((size) => {
      if (!active) return;
      setCatalogSize(size);
      setCatalogReady(true);
      const refresh = () => {
        void refreshGameCatalog().then((updatedSize) => {
          if (active) setCatalogSize(updatedSize);
        });
      };
      refresh();
      refreshTimer = window.setInterval(refresh, 30 * 60 * 1000);
    });
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'en' ? 'GameGuesser — How well do you know games?' : 'GameGuesser — Mennyire ismered a játékokat?';
  }, [language]);

  useEffect(() => {
    void import('./firebase-store').then(({ recordSitePageOpen }) => recordSitePageOpen()).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    let active = true;
    setIsAdmin(false);
    if (!user || !firebaseConfigured) return () => { active = false; };
    void hasAdminAccess(user)
      .then((allowed) => { if (active) setIsAdmin(allowed); })
      .catch(() => { if (active) setIsAdmin(false); });
    return () => { active = false; };
  }, [user?.uid]);

  useEffect(() => {
    let active = true;
    setIsPremium(false);
    setPremiumRequestPending(false);
    setPremiumRequestMessage('');
    setStreamerApproved(false);
    setStreamerRequestPending(false);
    if (!user || !firebaseConfigured) return () => { active = false; };
    const refreshAccess = () => {
      void Promise.all([hasPremiumAccess(user), hasPendingPremiumRequest(user), import('./firebase-store').then(({ hasStreamerAccess, hasPendingStreamerRequest }) => Promise.all([hasStreamerAccess(user), hasPendingStreamerRequest(user)]))])
        .then(([premium, pending, streamer]) => {
          if (!active) return;
          setIsPremium(premium);
          setPremiumRequestPending(pending);
          setStreamerApproved(streamer[0]);
          setStreamerRequestPending(streamer[1]);
        })
        .catch(() => { if (active) setIsPremium(false); });
    };
    refreshAccess();
    const refreshTimer = window.setInterval(refreshAccess, 30_000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!authReady) return;
    let active = true;
    const owner = user?.uid ?? 'guest';
    setProfileReady(false);
    setProfileOwner(null);
    setCloudStatus(user && firebaseConfigured ? 'loading' : 'local');

    async function hydrateProfile() {
      let nextProfile: CloudProfile;
      if (user && firebaseConfigured) {
        try {
          const cloudProfile = await loadCloudProfile(user);
          if (!active) return;
          if (cloudProfile) {
            nextProfile = {
              stats: normalizeStats(cloudProfile.stats),
              progress: isGameProgress(cloudProfile.progress) ? cloudProfile.progress : null,
              avatar: cloudProfile.avatar ?? defaultAvatar,
            };
          } else {
            // First sign-in imports this browser's anonymous progress into the new account.
            nextProfile = loadLocalProfile('guest');
            await saveCloudProfile(user, nextProfile);
          }
          if (!active) return;
          setCloudStatus('saved');
        } catch {
          if (!active) return;
          nextProfile = loadLocalProfile(owner);
          setCloudStatus('offline');
        }
      } else {
        nextProfile = loadLocalProfile(owner);
      }
      if (!active) return;
      setStats(nextProfile.stats);
      setAvatar(nextProfile.avatar ?? defaultAvatar);
      setProgress(isGameProgress(nextProfile.progress) ? nextProfile.progress : null);
      setProfileOwner(owner);
      setProfileReady(true);
    }

    void hydrateProfile();
    return () => { active = false; };
  }, [authReady, user?.uid]);

  useEffect(() => {
    if (!profileReady || !profileOwner || profileOwner !== (user?.uid ?? 'guest')) return;
    const nextProgress: GameProgress | null = screen === 'playing' && rounds.length > 0
      ? { mode, category, rounds, roundIndex, answer, wrongAnswers, revealedHints, score, streak, roundCorrect }
      : screen === 'complete' ? null : progress;
    const nextProfile: CloudProfile = { stats, progress: nextProgress as SavedProgress | null, avatar };
    if (JSON.stringify(progress) !== JSON.stringify(nextProgress)) setProgress(nextProgress);
    try {
      localStorage.setItem(`gameguesser-profile:${profileOwner}`, JSON.stringify(nextProfile));
      if (profileOwner === 'guest') localStorage.setItem('gameguesser-stats', JSON.stringify(stats));
    } catch {
      // Cloud saves still work even when local browser storage is unavailable.
    }

    if (!user || !firebaseConfigured) {
      setCloudStatus('local');
      return;
    }
    setCloudStatus('saving');
    const timer = window.setTimeout(() => {
      void saveCloudProfile(user, nextProfile)
        .then(() => setCloudStatus('saved'))
        .catch(() => setCloudStatus('offline'));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [profileReady, profileOwner, user?.uid, stats, avatar, screen, mode, category, rounds, roundIndex, answer, wrongAnswers, revealedHints, score, streak, roundCorrect, progress]);

  const availableGames = useMemo(
    () => category === 'Mind' ? games : games.filter((game) => game.category === category),
    [category, catalogSize],
  );
  const playableGames = mode === 'image'
    ? availableGames.filter((game) => steamAppIds[game.title] !== undefined)
    : availableGames;
  const storedRound = rounds[roundIndex];
  const currentRound = storedRound ? { ...storedRound, game: localizeGame(storedRound.game, language) } : undefined;
  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];
  const questionMode: ModeId = mode === 'marathon'
    ? (['emoji', 'clues', 'features'][roundIndex % 3] as ModeId)
    : mode === 'survival' ? 'emoji' : mode;
  const questionModeInfo = modes.find((item) => item.id === questionMode) ?? modes[0];

  useEffect(() => {
    const roundLimit = hasProAccess ? selectedRoundLimit : 10;
    if (roundLimit !== selectedRoundLimit) setSelectedRoundLimit(roundLimit);
  }, [hasProAccess, selectedRoundLimit]);

  useEffect(() => {
    if (!hasProAccess && (mode === 'marathon' || mode === 'survival')) setMode('emoji');
  }, [hasProAccess, mode]);

  useEffect(() => {
    if (!liveSessionId) return;
    if (!user || !firebaseConfigured || screen !== 'playing' || !currentRound) {
      if (user && firebaseConfigured) {
        void import('./firebase-store').then(({ clearLiveGame }) => clearLiveGame(user.uid, liveSessionId)).catch(() => undefined);
      }
      setLiveSessionId(null);
      return;
    }

    const publish = () => {
      void import('./firebase-store').then(({ publishLiveGame }) => publishLiveGame(liveSessionId, {
        ownerUid: user.uid,
        playerName: user.displayName || user.email || 'Játékos',
        kind: 'solo',
        mode: activeMode.title,
        roundIndex,
        totalRounds: rounds.length,
        solution: currentRound.game.title,
      })).catch(() => undefined);
    };
    publish();
    const heartbeat = window.setInterval(publish, 25_000);
    return () => window.clearInterval(heartbeat);
  }, [liveSessionId, user?.uid, user?.displayName, user?.email, firebaseConfigured, screen, currentRound?.game.title, activeMode.title, roundIndex, rounds.length, answer, wrongAnswers, revealedHints]);

  function startGame() {
    setLiveSessionId(crypto.randomUUID());
    setRounds(createRounds(playableGames, mode === 'marathon' || mode === 'survival' ? 20 : hasProAccess ? selectedRoundLimit : 10));
    setRoundIndex(0);
    setAnswer(null);
    setWrongAnswers([]);
    setRevealedHints(1);
    setImageUnavailable(false);
    setScore(0);
    setStreak(0);
    setRoundCorrect(0);
    setScreen('playing');
  }

  function chooseAnswer(title: string) {
    if (!currentRound || answer !== null || wrongAnswers.includes(title)) return;
    if (questionMode === 'image' && title !== currentRound.game.title) {
      setWrongAnswers((current) => [...current, title]);
      setRevealedHints((current) => Math.min(current + 1, 3));
      setStreak(0);
      return;
    }
    setAnswer(title);
    if (title === currentRound.game.title) {
      const earned = Math.max(40, 100 - (revealedHints - 1) * 20);
      setScore((current) => current + earned);
      setStreak((current) => {
        const next = current + 1;
        setStats((saved) => ({ ...saved, bestStreak: Math.max(saved.bestStreak, next) }));
        return next;
      });
      setRoundCorrect((current) => current + 1);
      setStats((saved) => ({ ...saved, correct: saved.correct + 1, totalScore: saved.totalScore + earned }));
    } else {
      setStreak(0);
    }
  }

  function continueGame() {
    const failedSurvivalRun = mode === 'survival' && answer !== currentRound?.game.title;
    if (roundIndex >= rounds.length - 1 || failedSurvivalRun) {
      setStats((saved) => ({
        ...saved,
        gamesPlayed: saved.gamesPlayed + 1,
        questionsPlayed: saved.questionsPlayed + (failedSurvivalRun ? roundIndex + 1 : roundCount),
        bestScore: Math.max(saved.bestScore, score),
      }));
      setScreen('complete');
      return;
    }
    setRoundIndex((current) => current + 1);
    setAnswer(null);
    setWrongAnswers([]);
    setRevealedHints(1);
    setImageUnavailable(false);
  }

  function revealHint() {
    setRevealedHints((current) => Math.min(current + 1, 3));
  }

  function resumeGame() {
    if (!progress || !isGameProgress(progress)) return;
    if (!hasProAccess && (progress.mode === 'marathon' || progress.mode === 'survival')) {
      setProgress(null);
      return;
    }
    setLiveSessionId(crypto.randomUUID());
    setMode(progress.mode);
    setCategory(progress.category);
    setRounds(progress.rounds);
    setRoundIndex(progress.roundIndex);
    setAnswer(progress.answer);
    setWrongAnswers(progress.wrongAnswers);
    setRevealedHints(progress.revealedHints);
    setScore(progress.score);
    setStreak(progress.streak);
    setRoundCorrect(progress.roundCorrect);
    setImageUnavailable(false);
    setScreen('playing');
  }

  async function submitPremiumRequest() {
    if (!user) {
      setAccountOpen(true);
      return;
    }
    setPremiumRequestBusy(true);
    setPremiumRequestMessage('');
    try {
      const { requestPremiumReview } = await import('./firebase-store');
      await requestPremiumReview(user);
      setPremiumRequestPending(true);
      setPremiumRequestMessage('Kérés elküldve. Az admin a fizetés ellenőrzése után aktiválja a Premium-tagságot.');
    } catch {
      setPremiumRequestMessage('Nem sikerült elküldeni a kérelmet. Ellenőrizd a bejelentkezést, majd próbáld újra.');
    } finally {
      setPremiumRequestBusy(false);
    }
  }

  function markStreamerSubmitted() {
    setStreamerRequestPending(true);
  }

  function togglePremiumTheme() {
    if (!hasProAccess) {
      setScreen('premium');
      return;
    }
    setPremiumTheme((current) => {
      const next = !current;
      localStorage.setItem('gameguesser-premium-theme', String(next));
      return next;
    });
  }

  function selectTheme(nextTheme: ThemeId) {
    localStorage.setItem('gameguesser-theme', nextTheme);
    setThemeId(nextTheme);
    setThemePickerOpen(false);
  }

  const roundCount = rounds.length;
  const accuracy = stats.questionsPlayed === 0 ? 0 : Math.round((stats.correct / stats.questionsPlayed) * 100);
  const accountLabel = cloudStatus === 'saving' || cloudStatus === 'loading' ? 'Mentés…' : cloudStatus === 'offline' ? 'Offline mentés' : 'Felhőbe mentve';

  return (
    <AutoTranslate>
    <div className={`app-shell ${premiumTheme && hasProAccess ? 'premium-theme' : ''}`} data-theme={themeId}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('home')} aria-label="Vissza a főoldalra">
          <span className="brand-mark"><Gamepad2 size={22} strokeWidth={2.4} /></span>
          <span>game<span className="brand-accent">guesser</span></span>
        </button>
        <div className="topbar-right">
          <div className="language-switch" aria-label="Language / Nyelv"><button className={language === 'hu' ? 'selected' : ''} onClick={() => setLanguage('hu')} aria-pressed={language === 'hu'}>HU</button><button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</button></div>
          <div className="theme-picker" ref={themePickerRef}>
            <button className="theme-picker-trigger" onClick={() => setThemePickerOpen((open) => !open)} aria-expanded={themePickerOpen} aria-haspopup="dialog" aria-label={language === 'en' ? 'Choose site theme' : 'Oldaltéma kiválasztása'} title={language === 'en' ? 'Choose site theme' : 'Oldaltéma kiválasztása'}><Palette size={15} /><span>{language === 'en' ? 'Themes' : 'Témák'}</span></button>
            {themePickerOpen && <div className="theme-picker-popover" role="dialog" aria-label={language === 'en' ? 'Choose a theme' : 'Válassz témát'}>
              <div className="theme-picker-heading"><strong>{language === 'en' ? 'Choose your look' : 'Válaszd ki a stílusod'}</strong><span>{language === 'en' ? 'The choice is saved in this browser.' : 'A választás ebben a böngészőben megmarad.'}</span></div>
              <div className="theme-picker-options">{siteThemes.map((theme) => <button key={theme.id} className="theme-option" style={{ '--theme-option-accent': theme.swatches[0] } as React.CSSProperties} onClick={() => selectTheme(theme.id)} aria-pressed={themeId === theme.id}>
                <span className="theme-option-swatches" aria-hidden="true">{theme.swatches.map((swatch) => <i key={swatch} style={{ '--swatch': swatch } as React.CSSProperties} />)}</span>
                <span className="theme-option-copy"><strong>{theme.name}</strong><small>{theme.description}</small></span>
                {themeId === theme.id && <Check size={15} className="theme-option-check" />}
              </button>)}</div>
            </div>}
          </div>
          <button className="leaderboard-nav" onClick={() => setScreen('leaderboard')} aria-label="Ranglista megnyitása"><Trophy size={16} /><span>Ranglista</span></button>
          <button className="streamer-directory-nav" onClick={() => setScreen('streamer-directory')} aria-label={language === 'en' ? 'Browse approved streamers' : 'Jóváhagyott streamerek listája'}><UsersRound size={16} /><span>Streamerek</span></button>
          <a className="topbar-discord-link" href="https://discord.gg/8rDPHVJnqz" target="_blank" rel="noopener noreferrer" aria-label={language === 'en' ? 'Join our Discord server' : 'Csatlakozz a Discord-szerverünkhöz'} title={language === 'en' ? 'Join our Discord server' : 'Csatlakozz a Discord-szerverünkhöz'}><MessageCircle size={15} /><span>Discord</span></a>
          <button className={`premium-nav ${isPremium ? 'is-premium' : ''}`} onClick={() => setScreen('premium')} aria-label="GameGuesser Premium"><Crown size={15} /><span>{isPremium ? 'Premium' : 'Premium'}</span></button>
          <button className="streamer-nav" onClick={() => setScreen('streamer')} aria-label="Streamer Program"><Radio size={15} /><span>Streamer</span></button>
          {user ? <button className="profile-chip account-chip" onClick={() => setAccountOpen(true)} aria-label="Fiók beállításai"><span className="avatar auth-avatar">{avatar}</span><span>{user.displayName || user.email || 'Fiókom'}</span></button> : <button className="profile-chip account-chip" onClick={() => setAccountOpen(true)} aria-label="Bejelentkezés vagy fiók létrehozása"><span className="avatar">{avatar}</span><span>Fiók létrehozása</span></button>}
        </div>
      </header>

      <main className="main-content">
        {screen === 'home' && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow"><Sparkles size={14} /> A TE JÁTÉKISMERETED, A TE KIHÍVÁSOD</div>
                <h1>{language === 'en' ? <>How well do you know<br />your <span>games?</span></> : <>Mennyire ismered<br />a <span>játékokat?</span></>}</h1>
                <p>Emojik, nyomok és fejtörők. Kapcsold be a gamer agyad, és találd ki, melyik játékra gondoltunk!</p>
                <div className="hero-tags"><span>🎮 {games.length}+ {language === 'en' ? 'games' : 'játék'}</span><span>⚡ {language === 'en' ? `${hasProAccess ? 6 : 4} game modes` : `${hasProAccess ? 6 : 4} játékmód`}</span><span>🏆 {language === 'en' ? 'Personal records' : 'Saját rekordok'}</span>{isPremium && <span className="premium-hero-tag"><Crown size={12} /> PREMIUM</span>}{streamerApproved && !isPremium && <span className="premium-hero-tag"><Radio size={12} /> STREAMER PRO</span>}</div>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="orbit orbit-a" /><div className="orbit orbit-b" />
                <div className="hero-console">🎮</div>
                <span className="float-emoji emoji-one">🕹️</span><span className="float-emoji emoji-two">👾</span><span className="float-emoji emoji-three">✨</span>
                <div className="art-caption">PRESS START <span>▶</span></div>
              </div>
            </section>

            {progress && (hasProAccess || (progress.mode !== 'marathon' && progress.mode !== 'survival')) && <section className="resume-card">
              <span className="resume-icon"><RotateCcw size={18} /></span>
              <span className="resume-copy"><strong>{language === 'en' ? 'You left a quiz unfinished' : 'Félbehagytál egy kvízt'}</strong><small>{modes.find((item) => item.id === progress.mode)?.title ?? (language === 'en' ? 'Quiz' : 'Kvíz')} · {language === 'en' ? `Question ${progress.roundIndex + 1} / ${progress.rounds.length}` : `${progress.roundIndex + 1}. kérdés / ${progress.rounds.length}`}</small></span>
              <button className="resume-button" onClick={resumeGame}>Folytatás <ArrowRight size={15} /></button>
            </section>}

            <section className="stats-strip" aria-label="Statisztikák">
              <div className="stat-item"><span className="stat-icon purple"><Trophy size={19} /></span><div><strong>{stats.bestScore}</strong><small>Legjobb pontszám</small></div></div>
              <div className="stat-item"><span className="stat-icon orange"><Flame size={19} /></span><div><strong>{stats.bestStreak}</strong><small>Legjobb sorozat</small></div></div>
              <div className="stat-item"><span className="stat-icon green"><Check size={19} /></span><div><strong>{stats.correct}</strong><small>Helyes válasz</small></div></div>
              <div className="stat-item"><span className="stat-icon blue"><Gamepad2 size={19} /></span><div><strong>{stats.gamesPlayed}</strong><small>Lejátszott kör</small></div></div>
            </section>

            {hasProAccess && <section className="premium-stats-card"><div className="premium-stats-heading"><span><Crown size={15} /> PREMIUM STATISZTIKÁK</span><strong>Részletes teljesítmény</strong></div><div className="premium-stats-grid"><div><strong>{stats.totalScore.toLocaleString(language === 'en' ? 'en-US' : 'hu-HU')}</strong><small>Összes szerzett pont</small></div><div><strong>{stats.questionsPlayed}</strong><small>Megválaszolt kérdés</small></div><div><strong>{accuracy}%</strong><small>Pontosság</small></div><div><strong>{stats.correct}</strong><small>Helyes válasz</small></div></div></section>}

            <section className="mode-section">
              <div className="section-heading"><div><span className="section-kicker">VÁLASSZ KIHÍVÁST</span><h2>Hogyan játszunk?</h2></div><span className="round-note"><span className="live-dot" /> Egy kör · {mode === 'marathon' || mode === 'survival' ? Math.min(20, playableGames.length) : Math.min(hasProAccess ? selectedRoundLimit : 10, playableGames.length)} kérdés</span></div>
              <div className="mode-grid">
                {modes.filter((item) => hasProAccess || !item.premium).map((item, index) => (
                  <button key={item.id} className={`mode-card ${mode === item.id ? 'selected' : ''} mode-${index}`} onClick={() => setMode(item.id)} aria-pressed={mode === item.id}>
                    <span className="mode-card-top"><span className="mode-icon">{item.icon}</span><span className="mode-check"><Check size={14} /></span></span>
                    <span className="mode-label">{item.label}</span><strong>{item.title}</strong><span className="mode-detail">{item.detail}</span>
                  </button>
                ))}
              </div>
              <div className="play-row">
                <label className="category-select"><span>{language === 'en' ? 'Category' : 'Kategória'}</span><select value={category} onChange={(event) => setCategory(event.target.value as 'Mind' | GameCategory)}>{categories.map((item) => <option key={item} value={item}>{language === 'en' ? ({ Mind: 'All games', Akció: 'Action', Kaland: 'Adventure', RPG: 'RPG', Indie: 'Indie', Stratégia: 'Strategy', Szimulátor: 'Simulation', Sport: 'Sports', Egyéb: 'Other' } as Record<string, string>)[item] : item === 'Mind' ? 'Minden játék' : item}</option>)}</select></label>
                <div className="play-actions">{hasProAccess && mode !== 'marathon' && mode !== 'survival' && <label className="premium-round-select"><span><Crown size={12} /> {language === 'en' ? 'Quiz length' : 'Kvíz hossza'}</span><select value={selectedRoundLimit} onChange={(event) => setSelectedRoundLimit(Number(event.target.value))}><option value={10}>{language === 'en' ? '10 questions' : '10 kérdés'}</option><option value={20}>{language === 'en' ? '20 questions · Marathon' : '20 kérdés · Maraton'}</option></select></label>}<span className="pool-count">{catalogReady ? (language === 'en' ? `${playableGames.length} games in the deck` : `${playableGames.length} játék a pakliban`) : (language === 'en' ? 'Loading game list…' : 'Játéklista betöltése…')}</span><button className="primary-button" onClick={startGame} disabled={!catalogReady || playableGames.length === 0}>{catalogReady ? (language === 'en' ? 'Start quiz' : 'Játék indítása') : (language === 'en' ? 'Loading…' : 'Betöltés…')} <ArrowRight size={18} /></button></div>
              </div>
            </section>
            {hasProAccess && <button className="premium-theme-toggle" onClick={togglePremiumTheme}><Crown size={14} /> {premiumTheme ? 'Arany téma bekapcsolva · Váltás' : 'Premium arany téma bekapcsolása'}</button>}
            <section className="duel-promo">
              <div className="duel-promo-icon"><Swords size={22} /></div>
              <div className="duel-promo-copy"><span>JÁTSSZATOK EGYÜTT</span><strong>Hívd ki a barátod vagy játsszatok együtt!</strong><small>Kétfős párbaj vagy korlátlan létszámú csoportszoba · Premium házigazdának 20 kérdés</small></div>
              <button className="duel-promo-button" onClick={() => setScreen('duel')} disabled={!catalogReady}>Játékszoba <ArrowRight size={17} /></button>
            </section>
            <footer className="home-footer"><span>{language === 'en' ? 'Play, learn, and beat your record.' : 'Játssz, tanulj, és döntsd meg a rekordod.'}</span></footer>
          </>
        )}

        {screen === 'duel' && <DuelRoom ownerUid={user?.uid} playerUid={user?.uid} ownerName={user?.displayName || user?.email || 'Játékos'} ownerAvatar={avatar} premium={hasProAccess} onOpenPremium={() => setScreen('premium')} onExit={() => setScreen('home')} />}
        {screen === 'admin' && isAdmin && user && <Suspense fallback={<div className="admin-loading"><span className="account-spinner">◌</span> Admin felület betöltése…</div>}><AdminPanel currentUid={user.uid} onExit={() => setScreen('home')} /></Suspense>}
        {screen === 'leaderboard' && <Suspense fallback={<div className="leaderboard-loading"><span className="account-spinner">◌</span> Ranglista betöltése…</div>}><LeaderboardPanel currentUid={user?.uid ?? null} onExit={() => setScreen('home')} /></Suspense>}
        {screen === 'premium' && <Suspense fallback={<div className="leaderboard-loading"><span className="account-spinner">◌</span> Premium betöltése…</div>}><PremiumPanel isSignedIn={!!user} isPremium={isPremium} requestPending={premiumRequestPending} requestBusy={premiumRequestBusy} requestMessage={premiumRequestMessage} onRequestReview={() => void submitPremiumRequest()} onSignIn={() => { setScreen('home'); setAccountOpen(true); }} onExit={() => setScreen('home')} /></Suspense>}
        {screen === 'streamer' && <Suspense fallback={<div className="leaderboard-loading"><span className="account-spinner">◌</span> Streamer Program betöltése…</div>}><StreamerPanel isSignedIn={!!user} isApproved={streamerApproved} requestPending={streamerRequestPending} onSignIn={() => { setScreen('home'); setAccountOpen(true); }} onSubmitted={markStreamerSubmitted} onExit={() => setScreen('home')} /></Suspense>}
        {screen === 'streamer-directory' && <Suspense fallback={<div className="leaderboard-loading"><span className="account-spinner">◌</span> Streamerlista betöltése…</div>}><StreamerDirectory onExit={() => setScreen('home')} /></Suspense>}

        {screen === 'playing' && currentRound && (
          <section className="game-screen">
            <div className="game-topline"><button className="back-button" onClick={() => setScreen('home')}><ArrowLeft size={17} /> Kilépés</button><div className="game-mode-pill"><span>{mode === 'marathon' ? questionModeInfo.icon : activeMode.icon}</span>{mode === 'marathon' ? <>{activeMode.title}<small> · {questionModeInfo.title}</small></> : activeMode.title}</div><span className="score-pill"><Trophy size={15} /> {score} pont</span></div>
            <div className="quiz-panel">
              <div className="quiz-progress-row"><span>KÉRDÉS <b>{String(roundIndex + 1).padStart(2, '0')}</b> <i>/ {String(roundCount).padStart(2, '0')}</i></span><span className="streak-label"><Flame size={15} /> {streak} {language === 'en' ? 'streak' : 'sorozat'}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${((roundIndex + 1) / roundCount) * 100}%` }} /></div>
              <div className="question-area">
                <span className="question-kicker">MELYIK JÁTÉKRA GONDOLTUNK?</span>
                {questionMode === 'emoji' && <div className="emoji-clue" aria-label="Emoji nyomok">{currentRound.game.emojis}</div>}
                {questionMode === 'clues' && <div className="clue-title"><span className="clue-badge">NYOMOK</span><h2>Rakd össze a történetet!</h2></div>}
                {questionMode === 'features' && <div className="clue-title"><span className="clue-badge">JÁTÉKJELLEMZŐK</span><h2>Melyik játék illik rájuk?</h2></div>}
              </div>
              {questionMode === 'image' && <div className="image-challenge">
                <div className="image-frame" aria-label="Elhomályosított játékillusztráció">
                  {!imageUnavailable && <img src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamAppIds[currentRound.game.title]}/header.jpg`} alt="Játékkép" style={{ filter: `blur(${answer === currentRound.game.title ? 0 : Math.max(0, 24 - wrongAnswers.length * 8)}px)` }} onError={() => setImageUnavailable(true)} />}
                  {imageUnavailable && <div className="image-fallback" style={{ filter: `blur(${answer === currentRound.game.title ? 0 : Math.max(0, 24 - wrongAnswers.length * 8)}px)` }} aria-hidden="true">{currentRound.game.emojis}</div>}
                  <span className="blur-label">{answer === currentRound.game.title ? 'HELYES TALÁLAT · TELJES KÉP' : wrongAnswers.length === 0 ? 'HOMÁLYOS KÉP' : `${wrongAnswers.length} HIBÁS TIPP · ÉLESEBB KÉP`}</span>
                </div>
                <div className="image-hints" aria-live="polite"><span className="image-hints-label"><Lightbulb size={14} /> SEGÍTSÉG · {revealedHints}/3</span>{currentRound.game.clues.slice(0, revealedHints).map((clue, index) => <p key={clue}><b>{index + 1}.</b> {clue}</p>)}</div>
              </div>}
              {questionMode === 'features' && <div className="feature-list">{currentRound.game.features.map((feature) => <span key={feature}><Check size={15} /> {feature}</span>)}</div>}
              {questionMode !== 'image' && mode !== 'survival' && <div className="hint-list" aria-live="polite">
                {currentRound.game.clues.slice(0, revealedHints).map((clue, index) => <div className="hint-line" key={clue}><span>{String(index + 1).padStart(2, '0')}</span>{clue}</div>)}
              </div>}
              {questionMode !== 'image' && mode !== 'survival' && !answer && <button className="hint-button" onClick={revealHint} disabled={revealedHints >= 3}><Lightbulb size={16} /> {revealedHints >= 3 ? 'Minden nyom felfedve' : 'Mutass még egy nyomot'} <small>{revealedHints < 3 ? '−20 pont' : ''}</small></button>}
              <div className="answers-grid">
                {currentRound.choices.map((choice, index) => {
                  const isCorrect = choice.title === currentRound.game.title;
                  const isSelected = answer === choice.title;
                  const wasWrong = wrongAnswers.includes(choice.title);
                  const resultClass = answer ? (isCorrect ? 'correct' : isSelected ? 'incorrect' : 'muted-answer') : wasWrong ? 'incorrect' : '';
                  return <button key={choice.title} className={`answer-option ${resultClass}`} onClick={() => chooseAnswer(choice.title)} disabled={answer !== null || wasWrong}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{choice.title}</span>{answer && isCorrect && <Check size={18} className="answer-result-icon" />}{(answer && isSelected && !isCorrect || questionMode === 'image' && wasWrong) && <X size={18} className="answer-result-icon" />}</button>;
                })}
              </div>
              {questionMode === 'image' && wrongAnswers.length > 0 && !answer && <div className="feedback-bar feedback-wrong image-feedback"><div><span className="feedback-icon">🔍</span><span><strong>Ez most nem talált!</strong><small>Élesebb lett a kép, és új segítséget kaptál. Próbáld újra!</small></span></div><span className="tries-left">{4 - wrongAnswers.length} tipp maradt</span></div>}
              {answer && <div className={`feedback-bar ${answer === currentRound.game.title ? 'feedback-correct' : 'feedback-wrong'}`}><div><span className="feedback-icon">{answer === currentRound.game.title ? '🎉' : '💡'}</span><span><strong>{answer === currentRound.game.title ? 'Ez az, eltaláltad!' : 'Majdnem!'}</strong><small>{answer === currentRound.game.title ? `+${Math.max(40, 100 - (revealedHints - 1) * 20)} pont — jöhet a következő?` : `A helyes válasz: ${currentRound.game.title}`}</small></span></div><button onClick={continueGame}>{mode === 'survival' && answer !== currentRound.game.title ? 'Menet vége' : roundIndex === roundCount - 1 ? 'Eredmény' : 'Következő'} <ArrowRight size={16} /></button></div>}
              <div className="quiz-foot"><span><Lightbulb size={14} /> {mode === 'survival' ? 'Egy rossz válasz véget vet a menetnek' : questionMode === 'image' ? 'Minden hibás tipp élesíti a képet' : 'Kevesebb nyomért több pont jár'}</span><span>{questionMode === 'image' ? `${wrongAnswers.length} hibás tipp` : `${roundCorrect} / ${roundIndex + (answer ? 1 : 0)} helyes`}</span></div>
            </div>
          </section>
        )}

        {screen === 'complete' && (
          <section className="complete-screen">
            <button className="back-button complete-back" onClick={() => setScreen('home')}><ArrowLeft size={17} /> Főoldal</button>
            <div className="complete-card"><div className="complete-confetti">🏆</div><span className="section-kicker">{mode === 'survival' ? 'TÚLÉLÉS VÉGE' : 'KÖR TELJESÍTVE'}</span><h1>{mode === 'survival' ? roundCorrect === roundCount ? 'Sikeres túlélés!' : 'Vége a menetnek' : 'Szép játék!'}</h1><p>{mode === 'survival' ? roundCorrect === roundCount ? (language === 'en' ? 'You completed all 20 questions without a mistake!' : 'Mind a 20 kérdést hiba nélkül teljesítetted!') : (language === 'en' ? `You answered ${roundCorrect} questions correctly before losing your life.` : `Helyesen válaszoltál ${roundCorrect} kérdésre, mielőtt elfogyott az életed.`) : roundCorrect >= 8 ? 'Te aztán ismered a játékokat!' : 'Még egy kör, és meglesz az új rekord!'}</p><div className="result-score"><strong>{score}</strong><span>pont</span></div><div className="result-stats"><div><strong>{roundCorrect}/{mode === 'survival' ? roundIndex + 1 : roundCount}</strong><span>Helyes válasz</span></div><div><strong>{stats.bestStreak}</strong><span>Legjobb sorozat</span></div><div><strong>{stats.bestScore}</strong><span>Rekordpontszám</span></div></div><div className="complete-actions"><button className="primary-button" onClick={startGame}><RotateCcw size={17} /> Újra játszás</button><button className="secondary-button" onClick={() => setScreen('home')}>Másik mód <ArrowRight size={17} /></button></div></div>
          </section>
        )}
      </main>
      <div className="site-bottom"><span>GAMEGUESSER</span><span>{language === 'en' ? 'Guess it. Play more. 🕹️' : 'Találd ki. Játssz még. 🕹️'}</span></div>
      {user && cloudStatus !== 'local' && <span className="account-cloud-indicator"><span className={`cloud-indicator-dot ${cloudStatus}`} />{accountLabel}</span>}
      <AccountModal user={user} isAdmin={isAdmin} open={accountOpen} onClose={() => setAccountOpen(false)} onOpenAdmin={() => { setAccountOpen(false); setScreen('admin'); }} cloudStatus={cloudStatus} avatar={avatar} onAvatarChange={setAvatar} />
    </div>
    </AutoTranslate>
  );
}

export default App;
