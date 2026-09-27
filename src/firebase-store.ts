import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore/lite';
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
  await setDoc(userDocument(user), {
    ...profile,
    email: user.email,
    displayName: user.displayName,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function hasAdminAccess(user: User): Promise<boolean> {
  if (!firebaseConfigured || !auth) return false;
  const adminSnapshot = await getDoc(doc(getFirestore(auth.app), 'admins', user.uid));
  return adminSnapshot.exists() && adminSnapshot.data().active === true;
}

export type AdminProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
  stats: CloudProfile['stats'];
  progress: CloudProfile['progress'];
  updatedAt: Date | null;
};

export async function listAdminProfiles(): Promise<AdminProfile[]> {
  if (!auth || !firebaseConfigured) throw new Error('A Firebase nincs beállítva.');
  const database = getFirestore(auth.app);
  const [snapshots, admins] = await Promise.all([
    getDocs(collection(database, 'users')),
    getDocs(collection(database, 'admins')),
  ]);
  const adminUids = new Set(admins.docs.filter((snapshot) => snapshot.data().active === true).map((snapshot) => snapshot.id));
  return snapshots.docs.map((snapshot) => {
    const data = snapshot.data();
    const timestamp = data.updatedAt;
    return {
      uid: snapshot.id,
      email: typeof data.email === 'string' ? data.email : null,
      displayName: typeof data.displayName === 'string' ? data.displayName : null,
      isAdmin: adminUids.has(snapshot.id),
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
  await deleteDoc(doc(getFirestore(auth.app), 'users', uid));
}
