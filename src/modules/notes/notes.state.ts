import { atom, useAtom } from "jotai";
import type { Note } from "./note.entity";

// このファイルは画面上のノート一覧を一時的に保持する状態管理です。
// 画面を移動しても、必要な情報をメモリ上に残しておけるようにしています。
const notesAtom = atom<Note[]>([]);

export const useNoteStore = () => {
    const [notes, setNotes] = useAtom(notesAtom);
    const getAll = () => notes;
    const getOne = (id: number) => notes.find((note) => note.id === id);
    const set = (newNotes: Note[]) => {
        setNotes((oldNotes) => {
            const combineNotes = [...oldNotes, ...newNotes];
            const uniqueNotes: { [key: number]: Note } = {};

            for (const note of combineNotes) {
                uniqueNotes[note.id] = note;
            }

            return Object.values(uniqueNotes);
        });
    };
    const deleteNote = (id: number) => {
        const findChildrenIds = (parentId: number): number[] => {
            const childrenIds = notes
                .filter((note) => note.parentId == parentId)
                .map((child) => child.id);
            return childrenIds.concat(
                ...childrenIds.map((childId) => findChildrenIds(childId)),
            );
        };

        const childrenIds = findChildrenIds(id);
        setNotes((oldNotes) =>
            oldNotes.filter((note) => ![...childrenIds, id].includes(note.id)),
        );
    };
    const clear = () => setNotes([]);

    return { getAll, getOne, set, delete: deleteNote, clear };
};