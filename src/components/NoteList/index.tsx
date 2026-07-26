import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Note } from '../../modules/notes/note.entity';
import { noteRepository } from '../../modules/notes/note.repository';
import { useNoteStore } from '../../modules/notes/notes.state';

import NoteItem from './NoteItem';

/**
 * コンポーネントへ渡されるプロパティです。
 */
interface Props {

  /**
   * 階層の深さ
   */
  layer?: number;

  /**
   * 親ノートID
   *
   * ルートノート（最上位のノート）の場合は null です。
   *
   * ポイント①：ここを「undefined」ではなく「null」に統一します。
   * Firestore側（note.repository.ts）では、親を持たないノートの
   * parentId を必ず null として保存・変換しているため、
   * こちら側も null を基準に合わせる必要があります。
   */
  parentId?: string | null;

}

/**
 * ノート一覧を階層表示するコンポーネントです。
 *
 * 親ノートを展開すると、
 * 子ノートを再帰的に表示します。
 */
export default function NoteList({
  layer = 0,
  /**
   * ポイント②：デフォルト値を「undefined」ではなく「null」にします。
   *
   * これにより、
   *   <NoteList />（SideBarからの最上位呼び出し）
   * の parentId が null になり、
   *   ノート作成時に保存される parentId: null
   * と型・値の両方で一致するようになります。
   *
   * 修正前は parentId が undefined になっており、
   * 「null === undefined」は false と判定されるため、
   * 最上位のノートが一覧から見えなくなっていました。
   */
  parentId = null,
}: Props) {

  /**
   * ノート一覧
   */
  const noteStore =
    useNoteStore();

  const notes =
    noteStore.getAll();

  /**
   * 展開状態
   *
   * key   : ノートID
   * value : 展開中かどうか
   */
  const [
    expanded,
    setExpanded,
  ] = useState<Map<string, boolean>>(
    new Map(),
  );

  /**
   * ページ遷移
   */
  const navigate =
    useNavigate();

  /**
   * 子ノートを作成します。
   */
  const createChild = async (
    e: React.MouseEvent,
    parentId: string,
  ) => {
    e.preventDefault();

    try {
      const newNote =
        await noteRepository.create({
          parentId,
        });

      /**
       * Stateへ追加
       */
      noteStore.set([
        newNote,
      ]);

      /**
       * 親ノートを展開
       */
      setExpanded((prev: Map<string, boolean>) => {

        const next =
          new Map(prev);

        next.set(
          parentId,
          true,
        );

        return next;
      });

      /**
       * 作成したノートを開く
       */
      moveToDetail(
        newNote.id,
      );

    } catch (error) {

      console.error(error);
      alert(
        '子ノートの作成に失敗しました。',
      );
    }
  };

  /**
   * 子ノートを取得します。
   */
  const fetchChildren = async (
    e: React.MouseEvent,
    note: Note,
  ) => {
    e.preventDefault();

    try {
      const children =
        await noteRepository.find({
          parentId:
            note.id,
        });
      noteStore.set(
        children,
      );

      /**
       * 展開状態を切り替えます。
       */
      setExpanded((prev: Map<string, boolean>) => {

        const next =
          new Map(prev);

        next.set(
          note.id,
          !prev.get(note.id),
        );
        return next;
      });

    } catch (error) {
      console.error(error);
      alert(
        'ノートの取得に失敗しました。',
      );
    }
  };

  /**
   * ノート削除
   */
  const deleteNote = async (
    e: React.MouseEvent,
    noteId: string,
  ) => {
    e.preventDefault();
    try {
      await noteRepository.delete(
        noteId,
      );

      /**
       * Stateから削除
       */
      noteStore.delete(
        noteId,
      );

      /**
       * 一覧へ戻る
       */
      navigate('/');

    } catch (error) {
      console.error(error);
      alert(
        'ノートの削除に失敗しました。',
      );
    }
  };

  /**
   * ノート詳細画面へ移動します。
   */
  const moveToDetail = (
    noteId: string,
  ) => {
    navigate(
      `/notes/${noteId}`,
    );
  };

  return (
    <>
      {
        notes
          /**
           * 指定された親ノートの
           * 子ノートだけ表示します。
           *
           * parentIdのデフォルトをnullにしたことで、
           * 「親を持たないノート（parentId: null）」と
           * 「最上位で呼び出したNoteListのparentId」が
           * 正しく一致するようになります。
           */
          .filter(
            (note) =>
              note.parentId === parentId,
          )
          .map((note) => (
            <div
              key={note.id}
            >
              <NoteItem
                note={note}
                layer={layer}
                expanded={
                  expanded.get(
                    note.id,
                  )
                }
                onClick={() =>
                  moveToDetail(
                    note.id,
                  )
                }
                onCreate={(e) =>
                  createChild(
                    e,
                    note.id,
                  )
                }
                onExpand={(e) =>
                  fetchChildren(
                    e,
                    note,
                  )
                }
                onDelete={(e) =>
                  deleteNote(
                    e,
                    note.id,
                  )
                }
              />
              {
                expanded.get(
                  note.id,
                ) && (
                  <NoteList
                    layer={
                      layer + 1
                    }
                    parentId={
                      note.id
                    }
                  />
                )
              }
            </div>
          ))
      }
    </>
  );
}