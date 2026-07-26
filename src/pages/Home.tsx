import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

import { noteRepository } from '../modules/notes/note.repository';
import { useNoteStore } from '../modules/notes/notes.state';

import '../styles/pages/home.css';

/**
 * ホーム画面です。
 *
 * 新しいノートを作成し、
 * 作成後はノート詳細画面へ移動します。
 */
export default function Home() {

  /**
   * 入力中のタイトル
   */
  const [
    title,
    setTitle,
  ] = useState('');

  /**
   * 作成中フラグ
   *
   * 二重クリック防止に利用します。
   */
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /**
   * ノート一覧(State)
   */
  const noteStore =
    useNoteStore();

  /**
   * ページ遷移
   */
  const navigate =
    useNavigate();

  /**
   * タイトル入力
   */
  const handleTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {

    setTitle(
      event.target.value,
    );

  };

  /**
   * ノートを新しく作成します。
   */
  const createNote = async () => {

    try {
      setIsSubmitting(true);
      /**
       * 前後の空白を除去します。
       */
      const trimmedTitle =
        title.trim();

      /**
       * タイトル未入力なら
       * 「無題」で作成します。
       */
      const newNote =
        await noteRepository.create({

          title:
            trimmedTitle || '無題',
        });

      /**
       * Stateへ追加
       */
      noteStore.set([
        newNote,
      ]);

      /**
       * 入力欄を初期化
       */
      setTitle('');

      /**
       * 作成したノートを開く
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

    <Card className="home-card">
      <CardHeader className="home-card-header">
        <CardTitle className="home-card-title">
          新しいノートを作成してみましょう
        </CardTitle>
      </CardHeader>

      <CardContent className="home-card-content">
        <div className="home-input-container">
          <input
            className="home-input"
            type="text"
            placeholder="ノートのタイトルを入力"
            value={title}
            onChange={
              handleTitleChange
            }
          />
          <button
            className="home-button"
            onClick={createNote}
            disabled={isSubmitting}
          >
            <FiPlus size={16} />
            <span>
              ノート作成
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}