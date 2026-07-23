// このファイルは「今ログインしているユーザー情報」をどこからでも参照できるようにするための状態です。
import { atom } from "jotai";
import type { User } from "../users/user.entity";

export const currentUserAtom = atom<User>();