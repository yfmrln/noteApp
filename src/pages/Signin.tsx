import { useState } from 'react';
import '../styles/pages/auth.css';
import { authRepository } from '../modules/auth/auth.repository';
import { currentUserAtom } from '../modules/auth/current-user.state';
import { writeSession } from '../lib/firestore-session';
import { useAtom } from 'jotai';
import { Link, Navigate } from 'react-router-dom';

// このコンポーネントはログイン画面です。
// ユーザーが入力したメールアドレスとパスワードを使って、認証処理を行います。
export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ログイン処理を実行します。
  // 失敗しても画面が止まらないように、例外エラーをキャッチしてユーザーに知らせます。
  const signin = async () => {
    setIsSubmitting(true);
    try {
      const { user, token } = await authRepository.signin(email, password);
      setCurrentUser(user);
      await writeSession(token, {
        id: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'ログインに失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  }

  const signinAnonymously = async () => {
    setIsSubmitting(true);
    try {
      const guestUser = {
        id: 'guest',
        email: 'anonymous@example.com',
        name: '匿名ユーザー',
        isAnonymous: true,
      };

      setCurrentUser(guestUser as any);
      await writeSession('guest-session', guestUser);
    } catch (error) {
      console.error(error);
      alert('匿名ログインに失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentUser) return <Navigate to='/' replace />;

  return (
    <div className='auth-container'>
      <div className='auth-wrapper'>
        <h2 className='auth-title'>Notionクローン</h2>
        <div className='auth-form-container'>
          <div className='auth-card'>
            <div className='auth-form'>
              <div>
                <label className='auth-label' htmlFor='email'>
                  メールアドレス
                </label>
                <div className='auth-input-container'>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id='email'
                    name='email'
                    placeholder='メールアドレス'
                    required
                    type='email'
                    className='input-auth'
                  />
                </div>
              </div>
              <div>
                <label className='auth-label' htmlFor='password'>
                  パスワード
                </label>
                <div className='auth-input-container'>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id='password'
                    name='password'
                    placeholder='パスワード'
                    required
                    type='password'
                    className='input-auth'
                  />
                </div>
              </div>
              <div>
                <button
                  onClick={signin}
                  disabled={!email || !password || isSubmitting}
                  className='home-button'
                  style={{ width: '100%' }}
                >
                  ログイン
                </button>
              </div>
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={signinAnonymously}
                  disabled={isSubmitting}
                  className='home-button'
                  style={{ width: '100%' }}
                >
                  匿名でログイン
                </button>
              </div>
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Link to='/signup' className='auth-link'>
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
