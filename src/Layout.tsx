// このファイルは画面全体の共通レイアウトを担当します。
// サイドバー、検索モーダル、ノート一覧をまとめて表示し、ログインしていない場合はログイン画面へ誘導します。
import SideBar from './components/SideBar';
import SearchModal from './components/SearchModal';
import './styles/layout.css';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { currentUserAtom } from './modules/auth/current-user.state';
import { useAtomValue } from 'jotai';
import { useNoteStore } from './modules/notes/notes.state';
import { useEffect, useState } from 'react';
import { noteRepository } from './modules/notes/note.repository';
import type { Note } from './modules/notes/note.entity';

export default function Layout() {
  const currentUser = useAtomValue(currentUserAtom);
  const [isLoading, setIsLoading] = useState(false);
  const noteStore = useNoteStore();
  const [isShowModal, setIsShowModal] = useState(false);
  const [searchResult, setSearchResult] = useState<Note[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, [currentUser?.id]);

  const fetchNotes = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    const notes = await noteRepository.find();
    noteStore.clear();
    noteStore.set(notes);
    setIsLoading(false);
  };

  const searchNote = async (keyword: string) => {
    const notes = await noteRepository.find({ keyword });
    noteStore.clear();
    noteStore.set(notes);
    setSearchResult(notes ?? []);
  };

  const moveToDetail = (noteId: number) => {
    navigate(`/notes/${noteId}`);
    setIsShowModal(false);
  };

  if (!currentUser) return <Navigate to="/signin" replace />;

  return (
    <div className='layout-container'>
      {!isLoading && (
        <SideBar onSearchButtonClick={() => setIsShowModal(true)} />
      )}
      <main className='layout-main'>
        <Outlet />
      </main>
      <SearchModal 
        isOpen={isShowModal}
        onClose={() => setIsShowModal(false)}
        notes={searchResult}
        onKeywordChange={searchNote}
        onItemSelect={moveToDetail}
      />
    </div>
  );
}
