import { useParams } from 'react-router-dom';
import TitleInput from '../components/TitleInput';
import '../styles/pages/note-detail.css';
import { noteRepository } from '../modules/notes/note.repository';
import { useNoteStore } from '../modules/notes/notes.state';
import { useEffect, useState } from 'react';
import { Editor } from '../components/Editor';
import { useDebouncedCallback } from 'use-debounce';

// この画面はノートの内容を表示・編集するためのページです。
// URLに含まれる ID を使って、対象のノートを読み込みます。
export default function NoteDetail() {
  const params = useParams();
  const id = parseInt(params.id!);
  const [isLoading, setIsLoading] = useState(false);
  const noteStore = useNoteStore();
  const note = noteStore.getOne(id);

  useEffect(() => {
    fetchOne();
  }, [id]);

  const fetchOne = async () => {
    setIsLoading(true);
    const note = await noteRepository.findOne(id);
    noteStore.set([note]);
    setIsLoading(false);
  };

  const updateNote = async (
    id: number,
    note: { title?: string; content?: string },
  ) => {
    const updatedNote = await noteRepository.update(id, note);
    noteStore.set([updatedNote]);
    return updatedNote;
  };

  const debounced = useDebouncedCallback(updateNote, 500);

  if (isLoading) return <div />;
  if (!note) return <div>note is not existed</div>;

  return (
    <div className="note-detail-container">
      <div className="note-detail-content">
        <TitleInput 
          initialData={note}
          onTitleChange={(title) => debounced(id, { title })}
        />
        <Editor
          initialContent={note.content}
          onChange={(content) => debounced(id, { content })}
        />
      </div>
    </div>
  );
}
