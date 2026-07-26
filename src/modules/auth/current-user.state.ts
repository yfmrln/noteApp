// Jotai の atom を読み込みます。
// atom は、アプリ全体で共有できる状態（State）を作るための機能です。
import { atom } from 'jotai';

// User クラスの型だけを利用します。
// type を付けることで、実行時のコードには含まれません。
import type { User } from '../users/user.entity';

/**
 * 現在ログインしているユーザーを保持する State です。
 *
 * この atom を利用することで、
 * どの画面からでもログイン中のユーザー情報を
 * 取得・更新できます。
 *
 * 初期値は undefined です。
 *
 * ログイン前
 *   currentUserAtom = undefined
 *
 * ログイン後
 *   currentUserAtom = User
 */
export const currentUserAtom = atom<User | undefined>(
  undefined,
);