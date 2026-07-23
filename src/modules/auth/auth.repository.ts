import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { readSessionToken } from '../../lib/firestore-session';
import { User } from '../users/user.entity';

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const getUserDoc = (email: string) => doc(db!, 'users', normalizeEmail(email));

const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(password));

    return Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, '0'),
    ).join('');
};

const verifyPassword = async (
    password: string,
    storedPassword?: string,
) => {
    if (!storedPassword) return false;

    const passwordHash = await hashPassword(password);
    return passwordHash === storedPassword || password === storedPassword;
};

export const authRepository = {
    async signup(
        name: string,
        email: string,
        password: string,
    ): Promise<{ user: User; token: string }> {
        if (!db) {
            throw new Error('Firebase の初期化が完了していません。環境変数を確認してください。');
        }

        const normalizedEmail = normalizeEmail(email);
        const existingUser = await getDoc(getUserDoc(normalizedEmail));

        if (existingUser.exists()) {
            throw new Error('このメールアドレスは既に使用されています');
        }

        const userId = crypto.randomUUID();
        const passwordHash = await hashPassword(password);
        const userData = {
            id: userId,
            name,
            email: normalizedEmail,
            passwordHash,
        };

        await setDoc(getUserDoc(normalizedEmail), userData);
        const token = crypto.randomUUID();

        return {
            user: new User({
                id: userData.id,
                name: userData.name,
                email: userData.email,
            }),
            token,
        };
    },
    async signin(
        email: string,
        password: string,
    ): Promise<{ user: User; token: string }> {
        if (!db) {
            throw new Error('Firebase の初期化が完了していません。環境変数を確認してください。');
        }

        const normalizedEmail = normalizeEmail(email);
        const userSnapshot = await getDoc(getUserDoc(normalizedEmail));

        if (!userSnapshot.exists()) {
            throw new Error('メールアドレスまたはパスワードが正しくありません');
        }

        const userData = userSnapshot.data() as {
            id: string;
            name: string;
            email: string;
            passwordHash?: string;
            password?: string;
        };

        const isValidPassword = await verifyPassword(
            password,
            userData.passwordHash ?? userData.password,
        );

        if (!isValidPassword) {
            throw new Error('メールアドレスまたはパスワードが正しくありません');
        }

        const user = new User({
            id: userData.id,
            name: userData.name,
            email: userData.email,
        });

        const token = crypto.randomUUID();

        return { user, token };
    },
    async getCurrentUser(): Promise<User | undefined> {
        if (!db) return undefined;

        const sessionToken = await readSessionToken();
        if (!sessionToken) return undefined;

        const sessionSnapshot = await getDoc(doc(db, 'sessions', 'current'));
        if (!sessionSnapshot.exists()) return undefined;

        const sessionData = sessionSnapshot.data() as {
            user?: User;
        };

        if (!sessionData.user) return undefined;

        return new User(sessionData.user);
    },
};