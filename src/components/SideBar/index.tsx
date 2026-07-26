import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
} from 'react-icons/fi';

import Item from './Item';
import UserItem from './UserItem';
import NoteList from '../NoteList';

import { useNoteStore } from '../../modules/notes/notes.state';
import { noteRepository } from '../../modules/notes/note.repository';

/**
 * SideBarコンポーネントへ渡されるプロパティです。
 */
interface Props {

  /**
   * 検索ボタンが押された時の処理
   */
  onSearchButtonClick: () => void;

  /**
   * ポイント①：ノート一覧を取得中かどうか
   *
   * Layout側で「ノート取得中」の状態を管理しているので、
   * それをここで受け取れるように型を追加します。
   *
   * これを追加しないと、Layout側から
   * isLoading={isLoading} と渡しても
   * 「そんなプロパティは無い」とTypeScriptに怒られます。
   */
  isLoading: boolean;

}

/**
 * アプリのサイドバーです。
 *
 * ・ログインユーザー
 * ・検索
 * ・ノート一覧
 * ・ノート作成
 *
 * を表示します。
 */
export default function SideBar({
  onSearchButtonClick,
  isLoading,
}: Props) {

  /**
   * ノート一覧(State)
   */
  const noteStore =
    useNoteStore();

  /**
   * 画面遷移
   */
  const navigate =
    useNavigate();

  /**
   * ノート作成中かどうか
   *
   * 二重クリック防止に利用します。
   */
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /**
   * 新しいノートを作成します。
   */
  const createNote = async () => {

    try {
      setIsSubmitting(true);
      /**
       * Firestoreへ保存します。
       */
      const newNote =
        await noteRepository.create({});

      /**
       * アプリ内の状態へ追加します。
       */
      noteStore.set([
        newNote,
      ]);

      /**
       * 作成したノート画面へ移動します。
       */
      navigate(
        `/notes/${newNote.id}`,
      );

    } catch (error) {
      console.error(error);
      alert(
        'ノートの作成に失敗しました。',
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div>
          {/* 上部メニュー */}
          <div>
            <UserItem />
            <Item
              label="検索"
              icon={FiSearch}
              onClick={onSearchButtonClick}
            />
          </div>

          {/* ノート一覧 */}
          <div className="sidebar-spacer">
            {/*
              ポイント②：SideBar自体を消すのではなく、
              「ノート一覧の部分だけ」ローディング表示を出し分けます。

              isLoadingがtrueの間はローディング文言を、
              falseになったらNoteListを表示します。

              こうすることでSideBarの骨格（ユーザー情報・検索ボタン・
              ノート作成ボタン）は常に表示されたままになり、
              画面全体がガクッと消えたり現れたりする
              「ちらつき」が起きなくなります。
            */}
            {
              isLoading
                ? (
                  <div className="sidebar-loading">
                    読み込み中...
                  </div>
                )
                : (
                  <NoteList />
                )
            }
            <Item
              label="ノートを作成"
              icon={FiPlus}
              onClick={
                isSubmitting
                  ? undefined
                  : createNote
              }
            />
          </div>
        </div>
      </aside>
      {/* メイン画面がサイドバーに隠れないよう余白を確保 */}
      <div className="sidebar-placeholder" />
    </>
  );
}