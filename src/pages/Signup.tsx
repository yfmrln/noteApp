import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';

import '../styles/pages/auth.css';

import { authRepository } from '../modules/auth/auth.repository';
import { currentUserAtom } from '../modules/auth/current-user.state';
import { writeSession } from '../lib/firestore-session';

/**
 * 新規登録画面
 *
 * 入力された
 * ・ユーザー名
 * ・メールアドレス
 * ・パスワード
 *
 * を利用して Firebase Authentication に登録します。
 */
export default function Signup() {

  /**
   * ユーザー名
   */
  const [name, setName] = useState('');

  /**
   * メールアドレス
   */
  const [email, setEmail] = useState('');

  /**
   * パスワード
   */
  const [password, setPassword] = useState('');

  /**
   * 現在ログイン中のユーザー
   */
  const [currentUser, setCurrentUser] =
    useAtom(currentUserAtom);

  /**
   * 登録ボタン連打防止
   */
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /**
   * 新規登録
   */
  const signup = async () => {

    setIsSubmitting(true);

    try {

      /**
       * Firebase Authenticationへ登録
       *
       * auth.repository.ts の signup() が
       * 実際の登録処理を行います。
       */
      const { user, token } =
        await authRepository.signup(
          name,
          email,
          password,
        );

      /**
       * アプリ全体で利用する
       * ログイン中ユーザーを保存
       */
      setCurrentUser(user);

      /**
       * Firestoreへセッション保存
       *
       * 保存先
       *
       * sessions/{uid}
       */
      await writeSession(
        token,
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      );
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : 'ユーザー登録に失敗しました',
      );
    } finally {
      setIsSubmitting(false);
    }

  };

  /**
   * ログイン済みなら
   * ホーム画面へ移動
   */
  if (currentUser) {
    return <Navigate to="/" replace />;
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
              <div>
                <label
                  htmlFor="username"
                  className="auth-label"
                >
                  ユーザー名
                </label>
                <div className="auth-input-container">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="ユーザー名"
                    className="input-auth"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                  />
                </div>
              </div>
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
                    name="email"
                    type="email"
                    placeholder="メールアドレス"
                    className="input-auth"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />
                </div>
              </div>
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
                    name="password"
                    type="password"
                    placeholder="パスワード"
                    className="input-auth"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <button
                  className="home-button"
                  style={{
                    width: '100%',
                  }}
                  onClick={signup}
                  disabled={
                    !name ||
                    !email ||
                    !password ||
                    isSubmitting
                  }
                >
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}