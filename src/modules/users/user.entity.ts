/**
 * アプリで利用するユーザー情報です。
 *
 * Firebase Authentication から取得した情報や
 * Firestore の users コレクションの情報を
 * このクラスで管理します。
 */
export class User {

  /**
   * Firebase Authentication の UID
   *
   * ユーザーを一意に識別するIDです。
   */
  readonly id: string;

  /**
   * メールアドレス
   *
   * サンプルユーザーの場合は空文字になります。
   */
  readonly email: string;

  /**
   * ユーザー名
   */
  readonly name: string;

  /**
   * サンプルログインかどうか
   */
  readonly isAnonymous: boolean;

  /**
   * User クラスを生成します。
   *
   * 引数で受け取った値を各プロパティへ代入します。
   */
  constructor(data: {
    id: string;
    email: string;
    name: string;
    isAnonymous?: boolean;
  }) {

    this.id = data.id;
    this.email = data.email;
    this.name = data.name;

    /**
     * isAnonymous が省略された場合は
     * false を設定します。
     */
    this.isAnonymous = data.isAnonymous ?? false;

  }

}