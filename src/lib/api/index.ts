// このファイルは API 通信の共通設定をまとめたものです。
// どの URL に送るかや、共通ヘッダーをここで決めます。
import axios from 'axios';
import { addAuthorizationHeader } from './interceptors/request';

const baseURL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL });
api.defaults.headers.common['Content-Type'] = 'application/json';
api.interceptors.request.use(addAuthorizationHeader);

export default api;
