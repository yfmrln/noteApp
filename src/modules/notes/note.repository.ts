// このファイルはノートの保存・取得・更新・削除をまとめて管理します。
// UI 側からはこのファイルを通して Firestore とやり取りします。
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { readSessionUser } from '../../lib/firestore-session';
import { Note } from './note.entity';

const getNotesCollection = () => collection(db!, 'notes');
const getNoteDoc = (id: number) => doc(db!, 'notes', String(id));

const normalizeNote = (id: number, data: Record<string, unknown>): Note => {
    return new Note({
        id,
        userId: data.userId as string,
        title: data.title as string | undefined,
        content: data.content as string | undefined,
        parentId: data.parentId as number | undefined,
        createAt: data.createAt as Date,
    });
};

const getCurrentUserId = async () => {
    const sessionUser = await readSessionUser();
    return sessionUser;
};

const filterAccessibleNotes = (notes: Note[], currentUser?: { id: string; isAnonymous?: boolean }) => {
    if (!currentUser) {
        return [];
    }

    return notes.filter((note) => note.userId === currentUser.id);
};

export const noteRepository = {
    async find(options?: {
        parentId?: number;
        keyword?: string;
    }): Promise<Note[]> {
        if (!db) return [];

        const currentUser = await getCurrentUserId();
        const result = await getDocs(getNotesCollection());
        const notes = result.docs.map((snapshot) =>
            normalizeNote(Number(snapshot.id), snapshot.data()),
        );

        const filtered = filterAccessibleNotes(notes, currentUser);

        if (options?.parentId != null) {
            return filtered.filter((note) => note.parentId === options.parentId);
        }

        if (options?.keyword) {
            const keyword = options.keyword.trim().toLowerCase();
            return filtered.filter((note) =>
                (note.title ?? '').toLowerCase().includes(keyword),
            );
        }

        return filtered;
    },
    async create(params: { title?: string; parentId?: number }): Promise<Note> {
        if (!db) {
            throw new Error('Firebase の初期化が完了していません。環境変数を確認してください。');
        }

        const currentUser = await getCurrentUserId();
        const id = Date.now();
        const noteData = {
            id,
            userId: currentUser?.id ?? 'guest',
            title: params.title ?? '無題',
            content: '',
            parentId: params.parentId ?? null,
            createAt: new Date().toISOString(),
        };

        await setDoc(getNoteDoc(id), noteData);
        return normalizeNote(id, noteData);
    },
    async findOne(id: number): Promise<Note> {
        if (!db) {
            throw new Error('Firebase の初期化が完了していません。環境変数を確認してください。');
        }

        const currentUser = await getCurrentUserId();
        const snapshot = await getDoc(getNoteDoc(id));
        if (!snapshot.exists()) {
            throw new Error('ノートが存在しません');
        }

        const note = normalizeNote(id, snapshot.data());
        if (!currentUser) {
            throw new Error('このノートは閲覧できません');
        }

        if (note.userId !== currentUser.id) {
            throw new Error('このノートは閲覧できません');
        }

        return note;
    },
    async update(
        id: number,
        note: { title?: string; content?: string },
    ): Promise<Note> {
        if (!db) {
            throw new Error('Firebase の初期化が完了していません。環境変数を確認してください。');
        }

        const currentUser = await getCurrentUserId();
        const snapshot = await getDoc(getNoteDoc(id));
        if (!snapshot.exists()) {
            throw new Error('ノートが存在しません');
        }

        const currentData = snapshot.data();
        const noteData = normalizeNote(id, currentData);
        if (!currentUser) {
            throw new Error('このノートは編集できません');
        }

        if (noteData.userId !== currentUser.id) {
            throw new Error('このノートは編集できません');
        }

        const updatedData = {
            ...currentData,
            ...note,
            createAt: currentData.createAt ?? new Date().toISOString(),
        };

        await setDoc(getNoteDoc(id), updatedData, { merge: true });
        return normalizeNote(id, updatedData);
    },
    async delete(id: number): Promise<boolean> {
        if (!db) {
            throw new Error('Firebase の初期化が完了していません。環境変数を確認してください。');
        }

        const currentUser = await getCurrentUserId();
        const snapshot = await getDoc(getNoteDoc(id));
        if (!snapshot.exists()) {
            throw new Error('ノートが存在しません');
        }

        const note = normalizeNote(id, snapshot.data());
        if (!currentUser) {
            throw new Error('このノートは削除できません');
        }

        if (note.userId !== currentUser.id) {
            throw new Error('このノートは削除できません');
        }

        await deleteDoc(getNoteDoc(id));
        return true;
    },
};