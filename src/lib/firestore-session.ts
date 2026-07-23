import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const SESSION_COLLECTION = 'sessions';
const SESSION_DOCUMENT = 'current';

type SessionUser = {
  id: string;
  email: string;
  name: string;
  isAnonymous?: boolean;
};
type SessionPayload = {
  token: string;
  user?: SessionUser;
};

export const readSessionToken = async (): Promise<string | null> => {
  if (!db) return null;

  const snapshot = await getDoc(doc(db, SESSION_COLLECTION, SESSION_DOCUMENT));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as SessionPayload;
  return data.token ?? null;
};

export const readSessionUser = async (): Promise<SessionUser | undefined> => {
  if (!db) return undefined;

  const snapshot = await getDoc(doc(db, SESSION_COLLECTION, SESSION_DOCUMENT));
  if (!snapshot.exists()) return undefined;

  const data = snapshot.data() as SessionPayload;
  return data.user;
};

export const writeSession = async (
  token: string,
  user: SessionUser,
) => {
  if (!db) return;

  await setDoc(
    doc(db, SESSION_COLLECTION, SESSION_DOCUMENT),
    {
      token,
      user,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
};

export const clearSession = async () => {
  if (!db) return;

  await deleteDoc(doc(db, SESSION_COLLECTION, SESSION_DOCUMENT));
};
