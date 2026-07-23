import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { FiPlus } from 'react-icons/fi';
import '../styles/pages/home.css';
import { useState } from 'react';
import { noteRepository } from '../modules/notes/note.repository';
import { useNoteStore } from '../modules/notes/notes.state';
import { useNavigate } from 'react-router-dom';

// この画面は「ノートを作るための入口」です。
// タイトルを入力してボタンを押すと、新しいノートを作成して詳細画面へ移動します。
export default function Home() {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const noteStore = useNoteStore();
  const navigate = useNavigate();

  // 新しいノートを作成する処理です。
  // 作成に成功したら、そのノートの詳細画面へすぐ移動させます。
  const createNote = async () => {
    setIsSubmitting(true);
    try {
      const newNote = await noteRepository.create({ title });
      noteStore.set([newNote]);
      setTitle('');
      navigate(`/notes/${newNote.id}`);
    } catch (error) {
      console.error(error);
      alert('ノートの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='home-card'>
      <CardHeader className='home-card-header'>
        <CardTitle className='home-card-title'>
          新しいノートを作成してみましょう
        </CardTitle>
      </CardHeader>
      <CardContent className='home-card-content'>
        <div className='home-input-container'>
          <input
            className='home-input'
            placeholder='ノートのタイトルを入力'
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button 
            className='home-button' 
            onClick={createNote}
            disabled={isSubmitting}
          >
            <FiPlus size={16} />
            <span>ノート作成</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
