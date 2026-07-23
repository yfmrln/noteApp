// リクエスト送信前に、ログインに必要なトークンを自動で付けるための処理です。
import type { InternalAxiosRequestConfig } from "axios";
import { readSessionToken } from '../../firestore-session';

export const addAuthorizationHeader = async (
    config: InternalAxiosRequestConfig,
) => {
    const token = await readSessionToken();
    if (!token) return config;
    config.headers.Authorization = `Bearer ${token}`;
    return config;
};
