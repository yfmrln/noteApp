// ノート1件分のデータの形を定義するクラスです。
// API から返ってきた内容を、このクラスにまとめて扱いやすくします。
export class Note {
    id!: number;
    userId!: string;
    title?: string | null;
    content?: string | null;
    parentId?: number | null;
    createAt!: Date;

    constructor(data: Note) {
        Object.assign(this, data);
        this.createAt = new Date(data.createAt);
    }
}