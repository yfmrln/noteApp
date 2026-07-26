// Firebase の基本機能を読み込みます。
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';

// Firestore（データベース）を利用するために読み込みます。
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase Authentication（認証）を利用するために読み込みます。
import {
  getAuth,
  type Auth,
} from 'firebase/auth';

/**
 * Firebase プロジェクトの設定
 *
 * Vite では .env ファイルに設定した値を
 * import.meta.env から取得します。
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Firebase の設定値がすべて存在するか確認します。
 *
 * 環境変数が不足している場合は
 * Firebase を初期化しません。
 */
const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

/**
 * Firebase アプリを初期化します。
 *
 * initializeApp() は一度しか実行できないため、
 * すでに初期化済みの場合は既存のアプリを利用します。
 */
export const firebaseApp: FirebaseApp | undefined =
  hasFirebaseConfig
    ? getApps().length > 0
      ? getApps()[0]
      : initializeApp(firebaseConfig)
    : undefined;

/**
 * Firestore（データベース）
 *
 * データの保存・取得に利用します。
 */
export const db: Firestore | undefined =
  firebaseApp
    ? getFirestore(firebaseApp)
    : undefined;

/**
 * Firebase Authentication（認証）
 *
 * メールログイン
 * Googleログイン
 * サンプルログイン
 * などの認証機能で利用します。
 */
export const auth: Auth | undefined =
  firebaseApp
    ? getAuth(firebaseApp)
    : undefined;