# GitHub Copilot 向けプロジェクト指示書

このドキュメントは、GitHub CopilotがこのNotionクローンアプリのコードを
提案・生成する際に、プロジェクトの規約・設計方針を理解するためのものです。

## プロジェクト概要

- React + TypeScript + Vite
- 状態管理: Jotai
- ルーティング: react-router-dom
- バックエンド: Firebase Authentication + Firestore
- UIコンポーネント: shadcn/ui 風の自前実装(`components/ui`配下)

## コーディングスタイル

### 1. 分割代入・関数引数は改行を多用する

このプロジェクトでは、可読性のために1つの値ごとに改行するスタイルを
採用しています。詰め込みすぎたコードは書かないでください。

```tsx
// 推奨
const [isLoading, setIsLoading] = useState(false);

// 非推奨(悪くはないが、このプロジェクトの流儀ではない)
const [isLoading, setIsLoading] = useState(false);
```

### 2. JSDocコメントは日本語で書く

すべての関数・変数・Propsの説明コメントは日本語のJSDoc形式で記述します。

```tsx
/**
 * 現在ログイン中のユーザー
 *
 * アプリ全体で利用します。
 */
const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
```

### 3. `interface Props` で型を定義する

コンポーネントのpropsは`type`ではなく`interface`で定義し、
各プロパティにJSDocコメントを付けます。

### 4. 非推奨APIを使わない

- Firebase Authの状態監視は必ず `onAuthStateChanged` を使う
  (マウント時に1回だけ取得する実装は避ける)
- 型は極力明示し、暗黙の`any`が発生しないようにする

## Firebase関連の重要な注意点

### 処理順序のルール(非常に重要)

Firestoreのセキュリティルールは `request.auth` を参照するため、
**認証状態とFirestore操作の順序を間違えるとpermissionエラーになります。**

- **ログイン時**: Firestoreへの書き込み(セッション保存など)を先に完了させてから、
  最後に `setCurrentUser()` などReact側の状態を更新する(画面遷移のトリガーになるため)
- **ログアウト時**: 逆に、`signOut()` で認証を切る**前**に、
  Firestoreのセッション削除などの書き込みを完了させる

```tsx
// ログイン: Firestore処理 → 状態更新の順
await writeSession(token, {...});
setCurrentUser(user);

// ログアウト: Firestore処理 → signOut → 状態更新の順
await clearSession();
await signOut(auth);
setCurrentUser(undefined);
```

### Firestoreルールとコレクションの対応を必ず確認する

新しいコレクションを追加した場合、必ず`firestore.rules`にも
対応するルールを追加すること。ルールに存在しないパスへのアクセスは
デフォルトで拒否されます。

### 非同期処理の競合(レースコンディション)に注意

ログアウトなど、途中でユーザーが切り替わる可能性がある非同期処理では、
`useRef`で「リクエスト開始時点のユーザーID」を保持し、
完了時に現在のユーザーと一致するか確認してから状態を更新する。

```tsx
const currentUserIdRef = useRef<string | undefined>(currentUser?.id);

useEffect(() => {
  currentUserIdRef.current = currentUser?.id;
}, [currentUser?.id]);

// 非同期処理内
const requestedUserId = currentUser.id;
const result = await someAsyncCall();
if (currentUserIdRef.current !== requestedUserId) {
  return; // すでに別ユーザーに切り替わっていたら結果を破棄
}
```

## React Hooksの依存配列に関する注意

- `useCallback`/`useEffect`の依存配列には、オブジェクトそのものではなく、
  可能な限り**プリミティブな値**(`user?.id`など)を指定する。
  オブジェクト参照の変化による不要な再実行・無限ループを避けるため。
- ローディング状態(`isLoading`)は、コンポーネントの表示・非表示の
  切り替えには使わない。骨格となるUI(サイドバーなど)は常に表示したままにし、
  中身だけをローディング表示に切り替える。

## CSS / z-indexの階層

重なり順のバグを防ぐため、z-index用のCSS変数は役割ごとに階層化して使う。
新しいオーバーレイ系のUIを追加する際は、以下の階層を守ること。

```css
:root {
  --z-sidebar: ...; /* スマホ用の引き出しサイドバー */
  --z-dropdown: ...; /* ドロップダウンメニュー */
  --z-modal: ...; /* モーダル・ダイアログ(最優先) */
}
```

モーダル(Dialog)は常に最前面に表示されるべきなので、
ドロップダウンやサイドバーより高い(または少なくとも同等の)
z-indexを使うこと。

## レスポンシブ対応

- ブレークポイントは `max-width: 768px` をスマホ判定の基準とする。
- スマホでは以下の要素を意図的に切り替える:
  - サイドバー: 通常は`fixed`+`transform: translateX()`で画面外に隠し、
    開閉状態(`isSidebarOpen`)に応じてスライドさせる
  - `position: fixed`の要素(ハンバーガーボタンなど)はドキュメントの
    レイアウトフローに影響しないため、重なるコンテンツ側で
    `padding-top`等を確保すること
- 新しいページ・コンポーネントを追加する際は、PCの見た目だけでなく、
  768px以下での崩れ(横幅超過、要素の重なりなど)も必ず考慮すること。

## Firestoreデータの型変換

Firestoreから取得した生データ(`Record<string, unknown>`)は、
必ず`normalizeNote`のような変換関数を通してから使う。
`typeof`チェックでデフォルト値にフォールバックし、想定外の型が
紛れ込んでもアプリが壊れないようにする。

## parentId等の「親を持たない」値の扱い

「親が存在しない」ことを表す値は、`undefined`ではなく`null`に統一する。
コンポーネントのデフォルト引数と、Firestoreに保存する値の両方で
一貫して`null`を使うこと(`undefined`と`null`の比較は`false`になるため、
一覧のフィルタリング処理などで表示漏れの原因になる)。
