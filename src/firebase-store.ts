import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
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
  await setDoc(userDocument(user), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
}
