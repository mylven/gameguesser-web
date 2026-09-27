import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type User,
} from 'firebase/auth';

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseConfigured = Object.values(config).every((value) => !!value);
const firebaseApp = firebaseConfigured
  ? getApps().length > 0 ? getApp() : initializeApp(config)
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;

export type ProfileStats = {
  gamesPlayed: number;
  questionsPlayed: number;
  correct: number;
  bestStreak: number;
  bestScore: number;
  totalScore: number;
};

export type SavedProgress = {
  mode: 'emoji' | 'clues' | 'features' | 'image';
  category: string;
  rounds: Array<{ game: unknown; choices: unknown[] }>;
  roundIndex: number;
  answer: string | null;
  wrongAnswers: string[];
  revealedHints: number;
  score: number;
  streak: number;
  roundCorrect: number;
};

export type CloudProfile = { stats: ProfileStats; progress: SavedProgress | null };

export async function prepareAuth(): Promise<void> {
  if (!auth) throw new Error('A fiókok használatához előbb be kell állítani a Firebase-t.');
  await setPersistence(auth, browserLocalPersistence);
}

export async function loadCloudProfile(user: User): Promise<CloudProfile | null> {
  const store = await import('./firebase-store');
  return store.loadCloudProfile(user);
}

export async function saveCloudProfile(user: User, profile: CloudProfile): Promise<void> {
  const store = await import('./firebase-store');
  await store.saveCloudProfile(user, profile);
}
