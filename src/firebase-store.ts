import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { auth, firebaseConfigured, type CloudProfile } from './firebase';
import type { User } from 'firebase/auth';

function userDocument(user: User) {
  if (!firebaseConfigured || !auth) throw new Error('A felhőmentés nincs beállítva.');
  return doc(getFirestore(auth.app), 'users', user.uid);
}

export async function loadCloudProfile(user: User): Promise<CloudProfile | null> {
  const snapshot = await getDoc(userDocument(user));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    stats: data.stats as CloudProfile['stats'],
    progress: (data.progress ?? null) as CloudProfile['progress'],
  };
}

export async function saveCloudProfile(user: User, profile: CloudProfile): Promise<void> {
  if (!auth || !firebaseConfigured) throw new Error('A felhőmentés nincs beállítva.');
  const database = getFirestore(auth.app);
  await setDoc(userDocument(user), {
    ...profile,
    email: user.email,
    displayName: user.displayName,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  const totalScore = Math.max(0, Math.floor(Number(profile.stats?.totalScore) || 0));
  const gamesPlayed = Math.max(0, Math.floor(Number(profile.stats?.gamesPlayed) || 0));
  if (totalScore > 0 || gamesPlayed > 0) {
    await setDoc(doc(database, 'leaderboard', user.uid), {
      displayName: user.displayName?.trim().slice(0, 32) || `Játékos ${user.uid.slice(-4)}`,
      totalScore,
      gamesPlayed,
      updatedAt: serverTimestamp(),
    });
  }
}

export type LeaderboardEntry = {
  id: string;
  displayName: string;
  totalScore: number;
  gamesPlayed: number;
};

export async function listLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!auth || !firebaseConfigured) throw new Error('A ranglista felhőszolgáltatása nincs beállítva.');
  const database = getFirestore(auth.app);
  const results = await getDocs(query(collection(database, 'leaderboard'), orderBy('totalScore', 'desc'), limit(100)));
  return results.docs.map((snapshot) => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      displayName: typeof data.displayName === 'string' ? data.displayName : 'Játékos',
      totalScore: Math.max(0, Number(data.totalScore) || 0),
      gamesPlayed: Math.max(0, Number(data.gamesPlayed) || 0),
    };
  });
}

export async function hasAdminAccess(user: User): Promise<boolean> {
  if (!firebaseConfigured || !auth) return false;
  const adminSnapshot = await getDoc(doc(getFirestore(auth.app), 'admins', user.uid));
  return adminSnapshot.exists() && adminSnapshot.data().active === true;
}

export async function hasPremiumAccess(user: User): Promise<boolean> {
  if (!firebaseConfigured || !auth) return false;
  const entitlement = await getDoc(doc(getFirestore(auth.app), 'premiumEntitlements', user.uid));
  return entitlement.exists() && entitlement.data().active === true;
}

export async function hasPendingPremiumRequest(user: User): Promise<boolean> {
  if (!firebaseConfigured || !auth) return false;
  const request = await getDoc(doc(getFirestore(auth.app), 'premiumRequests', user.uid));
  return request.exists();
}

export async function requestPremiumReview(user: User): Promise<void> {
  if (!firebaseConfigured || !auth || auth.currentUser?.uid !== user.uid || !user.email) {
    throw new Error('A Premium-igényléshez jelentkezz be e-mail-címmel.');
  }
  await setDoc(doc(getFirestore(auth.app), 'premiumRequests', user.uid), {
    displayName: user.displayName?.trim().slice(0, 32) || `Játékos ${user.uid.slice(-4)}`,
    email: user.email,
    requestedAt: serverTimestamp(),
  });
}

export type PremiumRequest = {
  uid: string;
  displayName: string;
  email: string;
  requestedAt: Date | null;
};

export async function listPremiumRequests(): Promise<PremiumRequest[]> {
  if (!firebaseConfigured || !auth) throw new Error('A fiókok használatához előbb be kell állítani a Firebase-t.');
  const snapshots = await getDocs(collection(getFirestore(auth.app), 'premiumRequests'));
  return snapshots.docs.map((snapshot) => {
    const data = snapshot.data();
    const timestamp = data.requestedAt;
    return {
      uid: snapshot.id,
      displayName: typeof data.displayName === 'string' ? data.displayName : 'Játékos',
      email: typeof data.email === 'string' ? data.email : '',
      requestedAt: timestamp && typeof timestamp.toDate === 'function' ? timestamp.toDate() as Date : null,
    };
  }).sort((left, right) => (right.requestedAt?.getTime() ?? 0) - (left.requestedAt?.getTime() ?? 0));
}

export async function grantPremiumAccess(request: Pick<PremiumRequest, 'uid' | 'displayName'>): Promise<void> {
  if (!firebaseConfigured || !auth) throw new Error('A Firebase nincs beállítva.');
  const database = getFirestore(auth.app);
  await setDoc(doc(database, 'premiumEntitlements', request.uid), {
    active: true,
    displayName: request.displayName,
    updatedAt: serverTimestamp(),
  });
  await deleteDoc(doc(database, 'premiumRequests', request.uid));
}

export async function revokePremiumAccess(uid: string): Promise<void> {
  if (!firebaseConfigured || !auth) throw new Error('A Firebase nincs beállítva.');
  await deleteDoc(doc(getFirestore(auth.app), 'premiumEntitlements', uid));
}

export type AdminProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
  isPremium: boolean;
  stats: CloudProfile['stats'];
  progress: CloudProfile['progress'];
  updatedAt: Date | null;
};

export async function listAdminProfiles(): Promise<AdminProfile[]> {
  if (!auth || !firebaseConfigured) throw new Error('A Firebase nincs beállítva.');
  const database = getFirestore(auth.app);
  const [snapshots, admins, entitlements] = await Promise.all([
    getDocs(collection(database, 'users')),
    getDocs(collection(database, 'admins')),
    getDocs(collection(database, 'premiumEntitlements')),
  ]);
  const adminUids = new Set(admins.docs.filter((snapshot) => snapshot.data().active === true).map((snapshot) => snapshot.id));
  const premiumUids = new Set(entitlements.docs.filter((snapshot) => snapshot.data().active === true).map((snapshot) => snapshot.id));
  return snapshots.docs.map((snapshot) => {
    const data = snapshot.data();
    const timestamp = data.updatedAt;
    return {
      uid: snapshot.id,
      email: typeof data.email === 'string' ? data.email : null,
      displayName: typeof data.displayName === 'string' ? data.displayName : null,
      isAdmin: adminUids.has(snapshot.id),
      isPremium: premiumUids.has(snapshot.id),
      stats: data.stats as CloudProfile['stats'],
      progress: (data.progress ?? null) as CloudProfile['progress'],
      updatedAt: timestamp && typeof timestamp.toDate === 'function' ? timestamp.toDate() as Date : null,
    };
  });
}

export async function setAdminAccess(uid: string, email: string | null, active: boolean): Promise<void> {
  if (!auth || !firebaseConfigured) throw new Error('A Firebase nincs beállítva.');
  const reference = doc(getFirestore(auth.app), 'admins', uid);
  if (active) {
    await setDoc(reference, { active: true, email, updatedAt: serverTimestamp() });
  } else {
    await deleteDoc(reference);
  }
}

export async function deletePlayerProfile(uid: string): Promise<void> {
  if (!auth || !firebaseConfigured) throw new Error('A Firebase nincs beállítva.');
  const database = getFirestore(auth.app);
  await Promise.all([
    deleteDoc(doc(database, 'users', uid)),
    deleteDoc(doc(database, 'leaderboard', uid)),
  ]);
}

export type LiveGameInput = {
  ownerUid: string;
  playerName: string;
  kind: 'solo' | 'multiplayer';
  mode: string;
  roundIndex: number;
  totalRounds: number;
  solution: string;
  roomCode?: string;
  roomType?: 'duel' | 'group';
  players?: string[];
  scores?: Record<string, number>;
};

export type LiveGame = LiveGameInput & { id: string; updatedAt: Date | null };

export async function publishLiveGame(sessionId: string, game: LiveGameInput): Promise<void> {
  if (!auth || !firebaseConfigured || auth.currentUser?.uid !== game.ownerUid) return;
  await setDoc(doc(getFirestore(auth.app), 'liveGames', sessionId), {
    ...game,
    updatedAt: serverTimestamp(),
  });
}

export async function clearLiveGame(ownerUid: string, sessionId: string): Promise<void> {
  if (!auth || !firebaseConfigured || auth.currentUser?.uid !== ownerUid) return;
  await deleteDoc(doc(getFirestore(auth.app), 'liveGames', sessionId));
}

export async function listLiveGames(): Promise<LiveGame[]> {
  if (!auth || !firebaseConfigured) throw new Error('A Firebase nincs beállítva.');
  const snapshots = await getDocs(collection(getFirestore(auth.app), 'liveGames'));
  return snapshots.docs.map((snapshot): LiveGame => {
    const data = snapshot.data();
    const timestamp = data.updatedAt;
    const kind: LiveGameInput['kind'] = data.kind === 'multiplayer' ? 'multiplayer' : 'solo';
    const roomType: LiveGameInput['roomType'] = data.roomType === 'group' || data.roomType === 'duel' ? data.roomType : undefined;
    return {
      id: snapshot.id,
      ownerUid: String(data.ownerUid ?? ''),
      playerName: String(data.playerName ?? 'Játékos'),
      kind,
      mode: String(data.mode ?? ''),
      roundIndex: Number(data.roundIndex) || 0,
      totalRounds: Number(data.totalRounds) || 0,
      solution: String(data.solution ?? ''),
      roomCode: typeof data.roomCode === 'string' ? data.roomCode : undefined,
      roomType,
      players: Array.isArray(data.players) ? data.players.map(String) : [],
      scores: data.scores && typeof data.scores === 'object' ? data.scores as Record<string, number> : {},
      updatedAt: timestamp && typeof timestamp.toDate === 'function' ? timestamp.toDate() as Date : null,
    };
  }).sort((left, right) => (right.updatedAt?.getTime() ?? 0) - (left.updatedAt?.getTime() ?? 0));
}
