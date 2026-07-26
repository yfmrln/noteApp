import { FiChevronsLeft, FiLogOut } from 'react-icons/fi';
import { useAtom } from 'jotai';
import { signOut } from 'firebase/auth';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import Item from './Item';

import { auth } from '../../lib/firebase';
import { clearSession } from '../../lib/firestore-session';
import { currentUserAtom } from '../../modules/auth/current-user.state';

/**
 * サイドバーに表示するユーザー情報です。
 *
 * ・ユーザー名の表示
 * ・メールアドレスの表示
 * ・ログアウト
 *
 * を担当します。
 */
export default function UserItem() {

  /**
   * 現在ログイン中のユーザー
   */
  const [currentUser, setCurrentUser] =
    useAtom(currentUserAtom);

  /**
   * ログアウト
   *
   * ポイント①：処理の順番がとても重要です。
   *
   * Firestoreのルールは
   *   request.auth != null && request.auth.uid == uid
   * を要求しています。つまり「Firebase Authがログイン状態のうちに」
   * Firestoreへの書き込み（セッション削除）を終わらせる必要があります。
   *
   * 先にsignOut()してしまうと、その時点でrequest.authがnullになり、
   * 後から呼ぶclearSession()が「Missing or insufficient permissions」
   * エラーになってしまいます。
   *
   * そのため、必ず
   *   ① Firestoreのセッション削除
   *   ② Firebase Authからログアウト
   *   ③ 最後にReactの状態を更新（画面切り替えのトリガー）
   * の順番で実行します。
   */
  const signout = async () => {

    try {

      /**
       * ① まだ認証が有効なうちに
       *    Firestoreのセッション情報を削除します。
       */
      await clearSession();

      /**
       * ② Firebase Authenticationからログアウトします。
       */
      if (auth) {
        await signOut(auth);
      }

      /**
       * ③ 最後にアプリ内のログイン情報をクリアします。
       *    （これでLayout側のガードが働き、/signin へ移動します）
       */
      setCurrentUser(undefined);

    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : 'ログアウトに失敗しました。',
      );
    }
  };

  /**
   * ログインしていない場合は何も表示しません。
   */
  if (!currentUser) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="user-item-trigger"
          role="button"
        >
          <div className="user-item-info">
            <span className="user-item-name">
              {currentUser.name} さんのノート
            </span>
          </div>
          <FiChevronsLeft
            className="user-item-chevron"
            size={16}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="user-item-dropdown"
        align="start"
        alignOffset={11}
        /**
         * ポイント②：forceMountを外します。
         *
         * forceMountは「閉じている間もDOMに残し続け、
         * 自前のアニメーションライブラリで退場処理を制御したい」
         * 場合だけ使う特殊なオプションです。
         *
         * このコンポーネントではそのようなアニメーション制御を
         * 行っていないため、付けたままだと
         * 「閉じているのに裏で存在し続けるDOM」が
         * 開いた瞬間に位置を再計算し直し、
         * 一瞬ズレた位置に表示されてから正しい位置へ移動する
         * ＝ちらつきの原因になります。
         *
         * 外すことで、DropdownMenu本来の「開いた時だけ描画する」
         * 挙動に戻り、位置が最初から正しく計算されます。
         */
        // forceMount ← 削除
      >
        <div className="user-item-dropdown-content">
          <p className="user-item-email">
            {currentUser.email || 'サンプルユーザー'}
          </p>
          <div className="user-item-info">
            <div>
              <p className="user-item-name-display">
                {currentUser.name}
              </p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="user-item-logout"
        >
          <Item
            label="ログアウト"
            icon={FiLogOut}
            onClick={signout}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  );

}