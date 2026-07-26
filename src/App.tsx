// アプリ全体の入口です。
// 起動時にログイン済みユーザーを取得し、
// 画面のルーティング（ページ切り替え）を行います。

import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';

// atomの「値を読む」フックと「値を書き込む」フックの両方が必要になります。
import { useAtomValue, useSetAtom } from 'jotai';

// ポイント①：非推奨ではない、Firebase公式の「認証状態監視」関数を使います。
//
// onAuthStateChanged は、
// ・ページを開いた直後（Firebaseがログイン情報を復元し終えたタイミング）
// ・ログインした瞬間
// ・ログアウトした瞬間
// のすべてで自動的に呼び出されます。
//
// 「1回だけ実行する処理」よりも、この方式のほうが
// 「今まさにログインしているかどうか」を正しく画面に反映できます。
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

import Layout from './Layout';

import Home from './pages/Home';
import NoteDetail from './pages/NoteDetail';
import Signin from './pages/Signin';
import Signup from './pages/Signup';

import { authRepository } from './modules/auth/auth.repository';
import { currentUserAtom } from './modules/auth/current-user.state';

import './styles/layout.css';

export default function App() {

  /**
   * 初期読み込み中かどうか
   *
   * true の間は「読み込み中...」だけを表示し、
   * ログイン画面やホーム画面は表示しません。
   */
  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  /**
   * 現在ログインしているユーザー（値の書き込み用）
   */
  const setCurrentUser =
    useSetAtom(
      currentUserAtom,
    );

  /**
   * 現在ログインしているユーザー（値の読み取り用）
   *
   * ポイント②：ルーティングの「ログイン必須の画面」を
   * 判定するために、ここで値を読み取れるようにします。
   */
  const currentUser =
    useAtomValue(
      currentUserAtom,
    );

  /**
   * Firebaseの認証状態を監視します。
   *
   * ポイント③：useEffect は「一度だけ実行」ではなく、
   * onAuthStateChanged という「監視の開始・終了」を
   * セットする形に変えています。
   *
   * こうすることで、リロード直後にFirebaseが
   * ログイン情報を復元し終わるタイミングを
   * 正しく待つことができます（＝表示のちらつき防止）。
   */
  useEffect(() => {

    // Firebaseの初期化が完了していない場合は何もしません。
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {

        try {

          if (firebaseUser) {

            /**
             * Firebase Authenticationではログイン済みなので、
             * Firestore側に保存してあるプロフィール情報を取得します。
             */
            const user =
              await authRepository.getCurrentUser();

            setCurrentUser(
              user,
            );

          } else {

            /**
             * ログインしていない状態
             */
            setCurrentUser(
              undefined,
            );

          }

        } catch (error) {

          console.error(error);
          setCurrentUser(
            undefined,
          );

        } finally {

          /**
           * ここまで来て初めて「読み込み完了」とします。
           */
          setIsLoading(false);

        }

      },
    );

    /**
     * ポイント④：コンポーネントが破棄される時に
     * 監視を止めます（メモリリーク防止のお作法）。
     */
    return () => {
      unsubscribe();
    };

  }, []);

  /**
   * ユーザー情報取得中は
   * 画面を表示しません。
   */
  if (isLoading) {

    return (
      <div>
        読み込み中...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {/* ログイン */}
          <Route
            path="/signin"
            element={<Signin />}
          />

          {/* 新規登録 */}
          <Route
            path="/signup"
            element={<Signup />}
          />

          {/*
            ログイン後画面

            ポイント⑤：ここが今回の重要な修正点です。
            currentUser が存在しない（＝未ログイン）場合は
            Layoutを表示せず、/signin へ強制的に移動させます。

            これをやらないと、未ログインのままLayout配下の
            SideBarやNoteListがFirestoreへアクセスしようとして
            「Missing or insufficient permissions」エラーが発生し、
            それが画面のちらつきの原因になります。
          */}
          <Route
            path="/"
            element={
              currentUser
                ? <Layout />
                : <Navigate to="/signin" replace />
            }
          >

            {/* ホーム */}
            <Route
              index
              element={<Home />}
            />

            {/* ノート詳細 */}
            <Route
              path="notes/:id"
              element={<NoteDetail />}
            />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}