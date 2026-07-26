// アプリ全体の共通レイアウトです。
// サイドバー・検索・メイン画面を表示します。
// ログインしているユーザーだけ利用できます。

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Navigate,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import {
  useAtomValue,
} from 'jotai';


import SideBar from './components/SideBar';
import SearchModal from './components/SearchModal';


import {
  currentUserAtom,
} from './modules/auth/current-user.state';

import {
  useNoteStore,
} from './modules/notes/notes.state';


import {
  noteRepository,
} from './modules/notes/note.repository';


import type {
  Note,
} from './modules/notes/note.entity';


import './styles/layout.css';



export default function Layout() {


  // 現在ログイン中のユーザー情報
  const currentUser =
    useAtomValue(
      currentUserAtom,
    );


  // ノート一覧を管理する状態
  const noteStore =
    useNoteStore();



  // ノート取得中かどうか
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);



  // 検索画面表示状態
  const [
    isShowModal,
    setIsShowModal,
  ] = useState(false);



  // 検索結果
  const [
    searchResult,
    setSearchResult,
  ] = useState<Note[]>([]);



  const navigate =
    useNavigate();


  /**
   * ポイント①：「今このIDのユーザーだけが有効」という
   * 目印をrefに保存します。
   *
   * refは再レンダリングされても値が消えず、
   * かつrefの値を変えても再レンダリングは起きません。
   * 「取得結果が今も使えるかどうかのチェック用の目印」
   * として使うのに向いています。
   */
  const currentUserIdRef =
    useRef<string | undefined>(
      currentUser?.id,
    );

  useEffect(() => {
    currentUserIdRef.current =
      currentUser?.id;
  }, [
    currentUser?.id,
  ]);



  /**
   * Firestoreから
   * 自分のノート一覧を取得します。
   */
  const fetchNotes =
    useCallback(async () => {


      // ログインしていない場合
      // Firestoreへアクセスしません。
      if (!currentUser) {
        return;
      }


      /**
       * このリクエストがどのユーザーのものか
       * 覚えておきます。
       */
      const requestedUserId =
        currentUser.id;


      try {

        setIsLoading(true);


        const notes =
          await noteRepository.find();


        /**
         * ポイント②：取得が完了した時点で、
         * 途中でログアウト（＝別のユーザーIDに変化）
         * していないか確認します。
         *
         * 変わっていたら、この結果はもう使いません。
         */
        if (
          currentUserIdRef.current !==
          requestedUserId
        ) {
          return;
        }


        // 古いデータを削除
        noteStore.clear();


        // 最新データを保存
        noteStore.set(
          notes,
        );


      } catch(error) {


        /**
         * ポイント③：エラーになった場合も同様に、
         * すでにログアウトしていたら
         * アラートを出さずに終了します。
         */
        if (
          currentUserIdRef.current !==
          requestedUserId
        ) {
          return;
        }


        console.error(
          'ノート取得エラー:',
          error,
        );


        alert(
          'ノート一覧の取得に失敗しました。',
        );


      } finally {

        /**
         * ローディング状態の解除も、
         * 今も有効なリクエストの時だけ行います。
         */
        if (
          currentUserIdRef.current ===
          requestedUserId
        ) {
          setIsLoading(false);
        }

      }


      /**
       * ポイント④：依存配列は「currentUser（オブジェクト）」ではなく
       * 「currentUser?.id（文字列）」にします。
       *
       * オブジェクトは中身が同じでも再生成されると別物扱いになりますが、
       * 文字列のidであれば同じ人である限り変化したと判定されません。
       * これにより不要な再実行（＝ちらつきの原因）を防ぎます。
       *
       * noteStoreも依存から外しています。
       * clear/setのような操作用関数は基本的に毎回同じものを指すため、
       * 依存に含める必要はありません。
       */
    }, [
      currentUser?.id,
    ]);



  /**
   * ログインユーザーが変わった時
   * ノートを読み込みます。
   */
  useEffect(() => {

    fetchNotes();

  }, [
    fetchNotes,
  ]);





  /**
   * ノート検索処理
   */
  const searchNote =
    async (
      keyword: string,
    ) => {


      try {


        const notes =
          await noteRepository.find({

            keyword:
              keyword.trim(),

          });



        setSearchResult(
          notes,
        );


      } catch(error) {


        console.error(
          '検索エラー:',
          error,
        );


        alert(
          '検索に失敗しました。',
        );


      }

    };





  /**
   * 選択したノート詳細へ移動
   */
  const moveToDetail =
    (
      noteId: string,
    ) => {


      navigate(
        `/notes/${noteId}`,
      );


      // 検索画面を閉じる
      setIsShowModal(false);

    };





  // ログインしていない場合
  // サインイン画面へ移動
  if (!currentUser) {

    return (
      <Navigate
        to="/signin"
        replace
      />
    );

  }





  return (

    <div className="layout-container">


      <SideBar
        isLoading={isLoading}
        onSearchButtonClick={() =>
          setIsShowModal(true)
        }
      />



      <main className="layout-main">

        <Outlet />

      </main>




      <SearchModal

        isOpen={
          isShowModal
        }


        onClose={() =>
          setIsShowModal(false)
        }


        notes={
          searchResult
        }


        onKeywordChange={
          searchNote
        }


        onItemSelect={
          moveToDetail
        }

      />


    </div>

  );

}