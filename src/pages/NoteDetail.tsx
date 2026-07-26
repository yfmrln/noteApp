import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

import { Editor } from '../components/Editor';
import TitleInput from '../components/TitleInput';

import { noteRepository } from '../modules/notes/note.repository';
import { useNoteStore } from '../modules/notes/notes.state';

import '../styles/pages/note-detail.css';

/**
 * ノート詳細画面です。
 *
 * URLで指定されたノートを取得し、
 * タイトルと本文を編集できます。
 */
export default function NoteDetail() {

  /**
   * URLパラメータ
   */
  const { id } = useParams();

  /**
   * ノート一覧(State)
   */
  const noteStore =
    useNoteStore();

  /**
   * 読み込み中
   */
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  /**
   * 現在のノート
   */
  const note =
    id
      ? noteStore.getOne(id)
      : undefined;

  /**
   * ノート取得
   */
  useEffect(() => {

    if (!id) {
      return;
    }
    void fetchOne();

  }, [
    id,
  ]);

  /**
   * Firestoreから
   * ノートを取得します。
   */
  const fetchOne = async () => {

    if (!id) {
      return;
    }

    try {
      setIsLoading(true);
      const note =
        await noteRepository.findOne(id);

      noteStore.set([
        note,
      ]);

    } catch (error) {
      console.error(error);
      alert(
        'ノートの取得に失敗しました。',
      );

    } finally {
      setIsLoading(false);
    }

  };

  /**
   * ノート更新
   */
  const updateNote = async (
    noteId: string,
    values: {
      title?: string;
      content?: string;
    },

  ) => {

    try {

      const updatedNote =
        await noteRepository.update(
          noteId,
          values,
        );
      noteStore.set([
        updatedNote,
      ]);
      return updatedNote;

    } catch (error) {

      console.error(error);
      alert(
        'ノートの保存に失敗しました。',
      );
    }
  };

  /**
   * 入力途中は保存せず、
   * 500ms入力が止まったら保存します。
   */
  const debouncedUpdate =
    useDebouncedCallback(
      updateNote,
      500,
    );

  /**
   * IDがない
   */
  if (!id) {
    return (
      <div>
        ノートIDが指定されていません。
      </div>
    );
  }

  /**
   * 読み込み中
   */
  if (isLoading) {
    return <div />;
  }

  /**
   * ノートが存在しない
   */
  if (!note) {
    return (
      <div>
        ノートが見つかりません。
      </div>
    );
  }

  return (
    <div className="note-detail-container">
      <div className="note-detail-content">
        <TitleInput
          initialData={note}
          onTitleChange={(title) =>
            debouncedUpdate(
              id,
              {
                title,
              },
            )
          }
        />
        <Editor
          initialContent={
            note.content
          }
          onChange={(content) =>
            debouncedUpdate(
              id,
              {
                content,
              },
            )
          }
        />
      </div>
    </div>
  );
}