# Notionクローン

React + TypeScript + Firebaseで作られた、Notion風のノートアプリです。
ノートの作成・階層管理・検索機能を備えています。

## 主な機能

- メールアドレス / 匿名でのログイン・新規登録
- ノートの作成・編集・削除
- 親子関係を持つノートの階層表示(無限に入れ子可能)
- キーワードによるノート検索(コマンドパレット形式)
- レスポンシブ対応(スマホでは開閉式のサイドバー)

## 技術スタック

| 分類 | 使用技術 |
|---|---|
| フレームワーク | React + TypeScript |
| ビルドツール | Vite |
| 状態管理 | Jotai |
| ルーティング | react-router-dom |
| バックエンド | Firebase Authentication / Firestore |
| UI部品 | 自前実装(shadcn/ui風、`components/ui`配下) |
| アイコン | react-icons |

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Firebaseプロジェクトの準備

1. [Firebase Console](https://console.firebase.google.com/)で新しいプロジェクトを作成します。
2. **Authentication** で「メール/パスワード」と「匿名」のサインイン方法を有効にします。
3. **Firestore Database** を作成します。
4. プロジェクト設定画面から、Webアプリ用の設定値(`apiKey`など)を取得します。

### 3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、取得した設定値を入力します。

```
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxxx
VITE_FIREBASE_PROJECT_ID=xxxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx
VITE_FIREBASE_APP_ID=xxxxx
```

### 4. Firestoreセキュリティルールのデプロイ

このアプリは `users` / `sessions` / `notes` の3つのコレクションを使用します。
`firestore.rules` を編集した場合は、必ずデプロイしてください。

```bash
firebase deploy --only firestore:rules
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

## フォルダ構成(抜粋)

```
src/
├── App.tsx                 # ルーティングの起点、認証状態の監視
├── Layout.tsx               # ログイン後の共通レイアウト(サイドバー等)
├── pages/
│   ├── Signin.tsx           # ログイン画面
│   ├── Signup.tsx           # 新規登録画面
│   ├── Home.tsx              # ホーム画面(ノート未選択時)
│   └── NoteDetail.tsx        # ノート詳細・編集画面
├── components/
│   ├── SideBar/               # サイドバー(ノート一覧・ユーザーメニュー)
│   ├── NoteList/               # ノート一覧の階層表示
│   ├── SearchModal.tsx          # ノート検索モーダル
│   └── ui/                       # 共通UIパーツ(Dialog, Command, DropdownMenuなど)
├── modules/
│   ├── auth/                  # 認証関連(リポジトリ・状態)
│   └── notes/                 # ノート関連(リポジトリ・状態・エンティティ)
├── lib/
│   ├── firebase.ts            # Firebase初期化
│   └── firestore-session.ts   # セッション情報の保存・削除
└── styles/                  # CSS(ページ・コンポーネント単位)
```

## Firestoreのデータ構造

| コレクション | 説明 | 主なフィールド |
|---|---|---|
| `users` | ユーザーのプロフィール情報 | `id`, `name`, `email` |
| `sessions` | ログインセッション情報 | `id`, `name`, `email`, `isAnonymous` |
| `notes` | ノート本体 | `userId`, `title`, `content`, `parentId`, `createAt` |

## 開発上の注意点

より詳しいコーディング規約やFirebase処理の順序に関する注意点は、
[`.github/copilot-instructions.md`](.github/copilot-instructions.md) にまとめています。

特に以下は不具合につながりやすいため、変更時は注意してください。

- ログイン/ログアウト時の「Firestore処理」と「認証状態の更新」の順序
- 新しいFirestoreコレクションを追加した際の`firestore.rules`への反映漏れ
- z-index(サイドバー・ドロップダウン・モーダルの重なり順)の階層

## ビルド

```bash
npm run build
```

`dist/` ディレクトリに本番用ファイルが出力されます。