import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../../lib/firebase';

import { User } from '../users/user.entity';

/**
 * メールアドレスを統一した形式へ変換します。
 *
 * 例
 * TEST@EXAMPLE.COM
 * ↓
 * test@example.com
 */
const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * users コレクションの参照を取得します。
 */
const getUserDoc = (uid: string) => doc(db!, 'users', uid);

export const authRepository = {
  /**
   * 新規登録
   *
   * Firebase Authenticationへユーザーを登録します。
   */
  async signup(
    name: string,
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {

    if (!auth || !db) {
      throw new Error(
        'Firebaseの初期化が完了していません。',
      );
    }

    // メールアドレスを統一
    const normalizedEmail = normalizeEmail(email);

    /**
     * Firebase Authenticationへ登録
     */
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );

    /**
     * Firebase Authenticationが発行したUID
     */
    const uid = credential.user.uid;

    /**
     * Firestoreにはプロフィールのみ保存します。
     *
     * パスワードは保存しません。
     */
    await setDoc(getUserDoc(uid), {
      id: uid,
      name,
      email: normalizedEmail,
    });

    /**
     * IDトークンを取得します。
     */
    const token =
      await credential.user.getIdToken();

    return {
      user: new User({
        id: uid,
        name,
        email: normalizedEmail,
      }),
      token,
    };
  },

  /**
   * メールアドレスでログイン
   */
  async signin(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {

    if (!auth || !db) {
      throw new Error(
        'Firebaseの初期化が完了していません。',
      );
    }

    const normalizedEmail =
      normalizeEmail(email);

    /**
     * Firebase Authenticationへログイン
     */
    const credential =
      await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );

    /**
     * Firestoreからプロフィールを取得します。
     */
    const snapshot =
      await getDoc(getUserDoc(credential.user.uid));

    if (!snapshot.exists()) {
      throw new Error(
        'ユーザー情報が存在しません。'
      );
    }

    const data = snapshot.data();

    const token =
      await credential.user.getIdToken();

    return {
      user: new User({
        id: data.id,
        name: data.name,
        email: data.email,
      }),
      token,
    };
  },

  /**
   * サンプルログイン
   */
async signinAnonymously(): Promise<{
  user: User;
  token: string;
}> {


  if (!auth) {

    throw new Error(
      'Firebaseの初期化が完了していません。',
    );

  }

    /*
    * Firebase Authenticationで
    * サンプルユーザーを作成します。
    *
    * Firebaseが自動でUIDを発行します。
    */
    const credential =
        await signInAnonymously(auth);



    const uid =
        credential.user.uid;

    /**
     * 初回だけFirestoreへ保存します。
     */
    const userRef = getUserDoc(uid);

    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {

      await setDoc(userRef, {
        id: uid,
        name: 'サンプルユーザー',
        email: '',
        isAnonymous: true,
      });

    }

  /*
   * Firebaseからログイントークン取得
   */
  const token =
    await credential.user.getIdToken();

  return {

    user:
      new User({
        id: uid,
        name:
          'サンプルユーザー',
        email:
          '',
        isAnonymous:
          true,
      }),
    token,

  };
  },

    /**
     * 現在ログインしているユーザーを取得します。
     *
     * 処理の流れ
     * 1. Firebase Authenticationでログイン中か確認
     * 2. セッション情報を取得
     * 3. セッションに保存されているユーザー情報を返す
     */
    async getCurrentUser(): Promise<User | undefined> {

        // Firebase Authentication が初期化されているか確認
        if (!auth) {
            return undefined;
        }

        // Firestore が初期化されているか確認
        if (!db) {
            return undefined;
        }

        // 現在ログインしている Firebase ユーザー
        const firebaseUser = auth.currentUser;

        // 未ログインなら終了
        if (!firebaseUser) {
            return undefined;
        }

        /**
         * sessions/{uid}
         */
        const sessionSnapshot = await getDoc(
            doc(db, 'sessions', firebaseUser.uid),
        );

        // セッションが存在しない
        if (!sessionSnapshot.exists()) {
            return undefined;
        }

        const sessionData = sessionSnapshot.data() as {
            user?: {
                id: string;
                name: string;
                email: string;
                isAnonymous?: boolean;
            };
        };

        // user が保存されていない
        if (!sessionData.user) {
            return undefined;
        }

        // User エンティティへ変換
        return new User({
            id: sessionData.user.id,
            name: sessionData.user.name,
            email: sessionData.user.email,
            isAnonymous: sessionData.user.isAnonymous,
        });
    },
};