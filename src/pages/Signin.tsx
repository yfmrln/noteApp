import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';

import '../styles/pages/auth.css';

import { authRepository } from '../modules/auth/auth.repository';
import { currentUserAtom } from '../modules/auth/current-user.state';
import { writeSession } from '../lib/firestore-session';


/**
 * ログイン画面です。
 *
 * 対応するログイン方法
 *
 * 1. メールアドレスログイン
 * 2. サンプルログイン
 */
export default function Signin() {


  /**
   * メールアドレス入力値
   */
  const [
    email,
    setEmail,
  ] = useState('');



  /**
   * パスワード入力値
   */
  const [
    password,
    setPassword,
  ] = useState('');



  /**
   * 現在ログイン中のユーザー
   *
   * アプリ全体で利用します。
   */
  const [
    currentUser,
    setCurrentUser,
  ] = useAtom(
    currentUserAtom,
  );



  /**
   * ボタン連打防止
   */
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);



  /**
   * メールアドレスログイン
   */
  const signin = async () => {


    setIsSubmitting(true);


    try {

      /*
       * Firebase Authenticationへ
       * メールアドレスでログインします。
       */
      const {
        user,
        token,
      } =
        await authRepository.signin(
          email,
          password,
        );

      /*
       * React側へログイン情報を保存します。
       */
      setCurrentUser(
        user,
      );

      /*
       * Firestoreへセッション保存します。
       *
       * 保存場所
       *
       * sessions/{uid}
       */
      await writeSession(
        token,
        {
          id:
            user.id,
          name:
            user.name,
          email:
            user.email,
        },
      );

    } catch(error) {

      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : 'ログインに失敗しました',
      );
    } finally {
      setIsSubmitting(false);
    }

  };


  /**
   *サンプルログイン
   */
  const signinAnonymously = async () => {
    setIsSubmitting(true);

    try {
         /**
           * Firebase Authenticationで
           * サンプルログインします。
           */
          const result =
            await authRepository.signinAnonymously();

          /**
           * Firebase Authの状態が
           * 完全に反映されるまで待ちます。
           *
           * Firestore Rulesの
           *
           * request.auth
           *
           * はFirebase Authを参照します。
           */
          await new Promise((resolve) =>
            setTimeout(resolve,300)
          );

          /**
           * Firestoreへセッション保存
           */
          await writeSession(
            result.token,
            {
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
              isAnonymous:true,
            },
          );

          /**
           * 最後にReact状態を更新します。
           *
           * 先に変更すると
           * LayoutがFirestoreアクセスして
           * 権限エラーになります。
           */
          setCurrentUser(
            result.user,
          );

    } catch(error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : 'サンプルログインに失敗しました',
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * すでにログイン済みなら
   * ホームへ移動します。
   */
  if(currentUser){

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <h2 className="auth-title">
          Notionクローン
        </h2>
        <div className="auth-form-container">
          <div className="auth-card">
            <div className="auth-form">
              {/* メールアドレス */}
              <div>
                <label
                  htmlFor="email"
                  className="auth-label"
                >
                  メールアドレス
                </label>
                <div className="auth-input-container">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="メールアドレス"
                    className="input-auth"
                    value={email}
                    onChange={(e)=>
                      setEmail(
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>

              {/* パスワード */}
              <div>
                <label
                  htmlFor="password"
                  className="auth-label"
                >
                  パスワード
                </label>

                <div className="auth-input-container">
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="パスワード"
                    className="input-auth"
                    value={password}
                    onChange={(e)=>
                      setPassword(
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>

              {/* メールログイン */}
              <button
                className="home-button"
                style={{
                  width:'100%',
                }}
                onClick={signin}
                disabled={
                  !email ||
                  !password ||
                  isSubmitting
                }
              >
                ログイン
              </button>

              {/* サンプルログイン */}
              <button
                className="home-button"
                style={{
                  width:'100%',
                  marginTop:12,
                }}
                onClick={
                  signinAnonymously
                }
                disabled={
                  isSubmitting
                }
              >
                サンプルでログイン
              </button>
              <div
                style={{
                  marginTop:12,
                  textAlign:'center',
                }}
              >
                <Link
                  to="/signup"
                  className="auth-link"
                >
                  新規登録はこちら
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}