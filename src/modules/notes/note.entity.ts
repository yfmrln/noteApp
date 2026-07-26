/**
 * ノート1件分のデータを表すクラスです。
 *
 * Firestore の notes コレクションに保存されている
 * データをアプリ内で扱いやすい形に変換します。
 */
export class Note {

  /**
   * Firestore のドキュメントIDです。
   *
   * 例
   * "gL2H7kP8xQ..."
   */
  readonly id: string;


  /**
   * ノートを作成したユーザーのUIDです。
   *
   * Firebase Authentication が発行した
   * UIDを保存します。
   */
  readonly userId: string;


  /**
   * ノートタイトルです。
   *
   * タイトルが未入力の場合でも、
   * アプリ内では「無題」という文字列で扱います。
   *
   * nullを使わないことで、
   * 画面表示時のエラーを防ぎます。
   */
  readonly title: string;


  /**
   * ノート本文です。
   *
   * 本文がない場合は null になります。
   */
  readonly content: string | null;


  /**
   * 親ノートIDです。
   *
   * 一番上のノートの場合は null になります。
   */
  readonly parentId: string | null;


  /**
   * 作成日時です。
   *
   * FirestoreにはISO形式の文字列で保存します。
   *
   * 例
   * 2026-07-22T09:20:21.275Z
   */
  readonly createAt: string;



  /**
   * Noteクラスを作成します。
   *
   * Firestoreから取得したデータを
   * アプリで使いやすい形へ変換します。
   */
  constructor(data: {

    /**
     * FirestoreドキュメントID
     */
    id: string;


    /**
     * 作成者UID
     */
    userId: string;


    /**
     * タイトル
     *
     * 未設定の場合があります。
     */
    title?: string | null;


    /**
     * 本文
     */
    content?: string | null;


    /**
     * 親ノートID
     */
    parentId?: string | null;


    /**
     * 作成日時
     */
    createAt: string;

  }) {


    /**
     * ドキュメントIDを保存
     */
    this.id = data.id;



    /**
     * 作成者UIDを保存
     */
    this.userId = data.userId;



    /**
     * タイトルを保存します。
     *
     * タイトルがない場合は
     * 「無題」にします。
     *
     * これにより、
     * アプリ内では必ずstringとして扱えます。
     */
    this.title =
      data.title ?? '無題';



    /**
     * 本文を保存します。
     *
     * 本文がない場合はnullです。
     */
    this.content =
      data.content ?? null;



    /**
     * 親ノートIDを保存します。
     *
     * 親がない場合はnullです。
     */
    this.parentId =
      data.parentId ?? null;



    /**
     * 作成日時を保存します。
     */
    this.createAt =
      data.createAt;

  }

}