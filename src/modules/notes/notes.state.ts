// Jotai の状態管理機能を読み込みます。
import { atom, useAtom } from 'jotai';

// Note クラスの型を利用します。
import type { Note } from './note.entity';

/**
 * ノート一覧を保持する State です。
 *
 * Firestoreから取得したノートを
 * メモリ上に保持することで、
 * 画面遷移しても再取得を減らせます。
 */
const notesAtom = atom<Note[]>([]);

/**
 * ノート一覧を操作するためのカスタムフックです。
 */
export const useNoteStore = () => {

  /**
   * ノート一覧
   */
  const [notes, setNotes] =
    useAtom(notesAtom);

  /**
   * 全ノート取得
   */
  const getAll = () => notes;

  /**
   * ノートを1件取得します。
   *
   * @param id FirestoreのドキュメントID
   */
  const getOne = (
    id: string,
  ) => {

    return notes.find(
      (note) => note.id === id,
    );

  };

  /**
   * ノート一覧を追加・更新します。
   *
   * 同じIDのノートが存在する場合は
   * 新しいデータで上書きします。
   */
  const set = (
    newNotes: Note[],
  ) => {

    setNotes((oldNotes) => {

      /**
       * Map は
       * 「ID → Note」
       * の形で保存できます。
       */
      const noteMap =
        new Map<string, Note>();

      /**
       * 既存データを登録
       */
      for (const note of oldNotes) {
        noteMap.set(
          note.id,
          note,
        );
      }

      /**
       * 新しいデータを登録
       *
       * 同じIDがある場合は
       * 上書きされます。
       */
      for (const note of newNotes) {
        noteMap.set(
          note.id,
          note,
        );
      }

      /**
       * Map → 配列へ戻します。
       */
      return Array.from(
        noteMap.values(),
      );

    });

  };

  /**
   * ノートを削除します。
   *
   * 子ノートも再帰的に削除します。
   */
  const deleteNote = (
    id: string,
  ) => {

    /**
     * 子ノートIDを取得します。
     */
    const findChildrenIds = (
      parentId: string,
    ): string[] => {

      const childrenIds =
        notes
          .filter(
            (note) =>
              note.parentId === parentId,
          )
          .map(
            (note) => note.id,
          );

      /**
       * 子ノートのさらに子ノートも取得します。
       */
      return childrenIds.concat(

        ...childrenIds.map(
          (childId) =>
            findChildrenIds(childId),
        ),

      );

    };

    /**
     * 削除対象一覧
     */
    const deleteIds =
      [
        id,
        ...findChildrenIds(id),
      ];

    /**
     * Stateから削除
     */
    setNotes((oldNotes) =>
      oldNotes.filter(
        (note) =>
          !deleteIds.includes(
            note.id,
          ),
      ),
    );

  };

  /**
   * ノート一覧を空にします。
   *
   * ログアウト時などに利用します。
   */
  const clear = () => {

    setNotes([]);

  };

  return {

    getAll,

    getOne,

    set,

    delete: deleteNote,

    clear,

  };

};