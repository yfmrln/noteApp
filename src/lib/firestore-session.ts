import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import { auth, db, } from './firebase';

/**
 * セッション情報を保存するコレクション名
 *
 * Firestore
 *
 * sessions
 *   └─ UID
 */
const SESSION_COLLECTION = 'sessions';

/**
 * セッションに保存するユーザー情報
 */
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  isAnonymous?: boolean;
};

/**
 * Firestoreへ保存するセッション情報
 */
type SessionPayload = {
  token: string;
  user?: SessionUser;
  updatedAt: string;
};

/**
 * 現在ログインしているユーザーの
 * セッションドキュメントを取得します。
 *
 * Firestore
 *
 * sessions
 *   └─ UID
 */
const getSessionDoc = () => {

  if (!db) {
    throw new Error(
      'Firestoreが初期化されていません。'
    );
  }

  if (!auth) {
    throw new Error(
      'Firebase Authenticationが初期化されていません。'
    );
  }

  /**
   * Firebase Authenticationへ
   * ログイン中のユーザーを取得します。
   */
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error(
      'ログインしていません。'
    );
  }

  /**
   * ドキュメントIDは
   * Firebase Authentication の UID を使用します。
   */
  return doc(
    db,
    SESSION_COLLECTION,
    currentUser.uid,
  );
};

/**
 * 保存されているトークンを取得します。
 */
export const readSessionToken =
  async (): Promise<string | null> => {

    const snapshot =
      await getDoc(getSessionDoc());

    if (!snapshot.exists()) {
      return null;
    }

    const data =
      snapshot.data() as SessionPayload;

    return data.token;
  };

/**
 * 保存されているユーザー情報を取得します。
 */
export const readSessionUser =
  async (): Promise<SessionUser | undefined> => {

    const snapshot =
      await getDoc(getSessionDoc());

    if (!snapshot.exists()) {
      return undefined;
    }

    const data =
      snapshot.data() as SessionPayload;

    return data.user;
  };

/**
 * セッション情報を書き込みます。
 *
 * merge:true にしているため、
 * 既存のデータを残したまま更新できます。
 */
export const writeSession = async (
  token: string,
  user: SessionUser,
) => {

  await setDoc(
    getSessionDoc(),
    {
      token,
      user,
      updatedAt: new Date().toISOString(),
    },
    {
      merge: true,
    },
  );
};

/**
 * セッション情報を削除します。
 */
export const clearSession = async () => {

  await deleteDoc(
    getSessionDoc(),
  );

};