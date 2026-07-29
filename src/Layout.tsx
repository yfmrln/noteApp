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

// ポイント①：ハンバーガーボタン用のアイコンを追加します。
import { FiMenu } from 'react-icons/fi';


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


  /**
   * ポイント②：サイドバーが開いているかどうかの状態です。
   *
   * スマホでは最初は閉じておきたいので、
   * 初期値をfalse（閉じている）にしています。
   *
   * PC表示ではCSS側（@media (max-width: 768px) の外）で
   * サイドバーを常に表示するようにしているため、
   * この状態はスマホ表示の時だけ意味を持ちます。
   */
  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(false);


  const navigate =
    useNavigate();


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

      if (!currentUser) {
        return;
      }

      const requestedUserId =
        currentUser.id;

      try {

        setIsLoading(true);

        const notes =
          await noteRepository.find();

        if (
          currentUserIdRef.current !==
          requestedUserId
        ) {
          return;
        }

        noteStore.clear();
        noteStore.set(notes);

      } catch(error) {

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

        if (
          currentUserIdRef.current ===
          requestedUserId
        ) {
          setIsLoading(false);
        }
      }

    }, [
      currentUser?.id,
    ]);

  useEffect(() => {

    fetchNotes();

  }, [
    fetchNotes,
  ]);


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
   *
   * ポイント③：スマホでノートを選んだ時、
   * サイドバーが開いたままだと操作しづらいので、
   * 自動的に閉じるようにします（PCでは影響ありません）。
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

      // サイドバーも閉じる（スマホ用）
      setIsSidebarOpen(false);

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

      {/*
        ポイント④：ハンバーガーボタンです。

        CSS側（layout.css）で
        「PCでは常にdisplay:none、スマホでのみ表示」
        となるようにしています。

        押すたびに isSidebarOpen を true/false 反転させます。
      */}
      <button
        type="button"
        className="hamburger-button"
        aria-label="メニューを開閉する"
        onClick={() =>
          setIsSidebarOpen(
            (prev) => !prev,
          )
        }
      >
        <FiMenu size={22} />
      </button>

      {/*
        ポイント⑤：サイドバーをラップするdivです。

        isSidebarOpenがtrueの時だけ
        "sidebar-open" というクラスを追加のクラス名として付けます。

        CSS側では
        ・PC表示：常に画面内に表示（通常のflexアイテム）
        ・スマホ表示：普段は画面外に隠し、sidebar-openが付いた時だけ
          画面内へスライドさせる
        という挙動を、このクラスの有無で切り替えています。
      */}
      <div
        className={
          isSidebarOpen
            ? 'sidebar-wrapper sidebar-open'
            : 'sidebar-wrapper'
        }
      >
        <SideBar
          isLoading={isLoading}
          onSearchButtonClick={() =>
            setIsShowModal(true)
          }
        />
      </div>


      {/*
        ポイント⑥：スマホでサイドバーが開いている時だけ表示する、
        背景の半透明の幕（オーバーレイ）です。

        ここをタップするとサイドバーが閉じます。
        PC表示ではCSS側で常にdisplay:noneにしているため、
        邪魔になりません。
      */}
      {
        isSidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() =>
              setIsSidebarOpen(false)
            }
          />
        )
      }

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