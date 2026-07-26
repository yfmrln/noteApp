// Firestore から必要な機能を読み込みます。
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

// Firebase Authentication とFirestore本体を読み込みます。
import { auth, db } from '../../lib/firebase';

// Noteクラス
import { Note } from './note.entity';


/**
 * notesコレクションを取得します。
 *
 * Firestoreでは、
 * collection() を使って操作対象を指定します。
 */
const getNotesCollection = () =>
  collection(db!, 'notes');



/**
 * Firestoreから取得したデータを
 * Noteクラスへ変換します。
 *
 * Firestoreのデータは型が保証されないため、
 * ここで安全な形へ変換します。
 */
const normalizeNote = (
  id: string,
  data: Record<string, unknown>,
): Note => {

  return new Note({

    // ドキュメントID
    id,


    // ユーザーID
    userId:
      typeof data.userId === 'string'
        ? data.userId
        : '',


    // タイトル
    title:
        typeof data.title === 'string'
            ? data.title
            : '無題',


    // 本文
    content:
      typeof data.content === 'string'
        ? data.content
        : null,


    // 親ノートID
    parentId:
      typeof data.parentId === 'string'
        ? data.parentId
        : null,


    // 作成日時
    createAt:
      typeof data.createAt === 'string'
        ? data.createAt
        : new Date().toISOString(),

  });

};



export const noteRepository = {


  /**
   * ノート一覧を取得します。
   *
   * サンプルログインでもFirebase Authenticationは
   * UIDを持っています。
   *
   * そのため通常ユーザーと同じく
   * userIdで検索します。
   */
  async find(
    options?: {
      parentId?: string | null;
      keyword?: string;
    },
  ): Promise<Note[]> {


    // Firebaseが利用できない場合
    if (!db || !auth) {
      return [];
    }


    // 現在ログイン中のユーザー取得
    const currentUser =
      auth.currentUser;


    // 未ログインの場合
    if (!currentUser) {
      return [];
    }



    /**
     * Firestore Rules:
     *
     * request.auth.uid
     * ==
     * notes.userId
     *
     * の条件に合わせています。
     *
     * サンプルユーザーもUIDを持つため
     * この条件で取得できます。
     */
    const firestoreQuery =
      query(
        getNotesCollection(),
        where(
          'userId',
          '==',
          currentUser.uid,
        ),
      );



    // Firestoreから取得
    const snapshot =
      await getDocs(
        firestoreQuery,
      );



    // FirestoreデータをNote型へ変換
    let notes =
      snapshot.docs.map(
        (docSnapshot) =>
          normalizeNote(
            docSnapshot.id,
            docSnapshot.data(),
          ),
      );



    // 親ノートで絞り込み
    if (options?.parentId !== undefined) {

      notes =
        notes.filter(
          (note) =>
            note.parentId === options.parentId,
        );

    }



    // タイトル検索
    if (options?.keyword) {

      const keyword =
        options.keyword
          .trim()
          .toLowerCase();


      notes =
        notes.filter(
          (note) =>
            note.title
              .toLowerCase()
              .includes(keyword),
        );

    }


    return notes;

  },



  /**
   * ノートを新規作成します。
   */
  async create(
    params: {
      title?: string;
      parentId?: string | null;
    },
  ): Promise<Note> {


    if (!db || !auth) {

      throw new Error(
        'Firebaseの初期化が完了していません。',
      );

    }



    const currentUser =
      auth.currentUser;



    if (!currentUser) {

      throw new Error(
        'ログインしてください。',
      );

    }



    // FirestoreがIDを自動生成
    const noteDoc =
      doc(
        getNotesCollection(),
      );



    /**
     * 保存するデータ
     *
     * userIdには必ずログインユーザーUIDを保存します。
     */
    const noteData = {

      id: noteDoc.id,

      userId:
        currentUser.uid,

      title:
        params.title ?? '無題',

      content:
        '',

      parentId:
        params.parentId ?? null,

      createAt:
        new Date().toISOString(),

    };



    await setDoc(
      noteDoc,
      noteData,
    );



    return normalizeNote(
      noteDoc.id,
      noteData,
    );

  },



  /**
   * ノートを1件取得します。
   */
  async findOne(
    id: string,
  ): Promise<Note> {


    if (!db || !auth) {

      throw new Error(
        'Firebaseの初期化が完了していません。',
      );

    }



    const currentUser =
      auth.currentUser;



    if (!currentUser) {

      throw new Error(
        'ログインしてください。',
      );

    }



    const noteDoc =
      doc(
        db,
        'notes',
        id,
      );



    const snapshot =
      await getDoc(
        noteDoc,
      );



    if (!snapshot.exists()) {

      throw new Error(
        'ノートが存在しません。',
      );

    }



    const note =
      normalizeNote(
        snapshot.id,
        snapshot.data(),
      );



    /**
     * 自分のノートだけ利用可能です。
     *
     * サンプルユーザーもUIDを持つため
     * 同じチェックを行います。
     */
    if (
      note.userId !== currentUser.uid
    ) {

      throw new Error(
        'このノートは閲覧できません。',
      );

    }



    return note;

  },



  /**
   * ノートを更新します。
   */
  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
    },
  ): Promise<Note> {


    if (!db || !auth) {

      throw new Error(
        'Firebaseの初期化が完了していません。',
      );

    }



    const currentUser =
      auth.currentUser;



    if (!currentUser) {

      throw new Error(
        'ログインしてください。',
      );

    }



    const noteDoc =
      doc(
        db,
        'notes',
        id,
      );



    const snapshot =
      await getDoc(
        noteDoc,
      );



    if (!snapshot.exists()) {

      throw new Error(
        'ノートが存在しません。',
      );

    }



    const currentData =
      snapshot.data();



    const currentNote =
      normalizeNote(
        snapshot.id,
        currentData,
      );



    // 所有者確認
    if (
      currentNote.userId !== currentUser.uid
    ) {

      throw new Error(
        'このノートは編集できません。',
      );

    }



    const updatedData = {

      ...currentData,

      ...data,

    };



    await setDoc(
      noteDoc,
      updatedData,
      {
        merge:true,
      },
    );



    return normalizeNote(
      noteDoc.id,
      updatedData,
    );

  },



  /**
   * ノートを削除します。
   */
  async delete(
    id:string,
  ):Promise<boolean>{


    if(!db || !auth){

      throw new Error(
        'Firebaseの初期化が完了していません。',
      );

    }



    const currentUser =
      auth.currentUser;



    if(!currentUser){

      throw new Error(
        'ログインしてください。',
      );

    }



    const noteDoc =
      doc(
        db,
        'notes',
        id,
      );



    const snapshot =
      await getDoc(
        noteDoc,
      );



    if(!snapshot.exists()){

      throw new Error(
        'ノートが存在しません。',
      );

    }



    const note =
      normalizeNote(
        snapshot.id,
        snapshot.data(),
      );



    /**
     * 自分のノートだけ削除できます。
     */
    if(
      note.userId !== currentUser.uid
    ){

      throw new Error(
        'このノートは削除できません。',
      );

    }



    await deleteDoc(
      noteDoc,
    );



    return true;

  },

};