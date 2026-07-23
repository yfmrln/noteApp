// ユーザー情報のデータ構造を定義するクラスです。
// 認証や表示に必要な項目をまとめて管理します。
export class User {
    id!: string;
    email!: string;
    name!: string;
    isAnonymous?: boolean;

    constructor(data: User) {
        Object.assign(this, data);
    }
}