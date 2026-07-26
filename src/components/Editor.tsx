import { ja } from '@blocknote/core/locales';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';

import '@blocknote/mantine/style.css';

/**
 * Editor コンポーネントへ渡されるデータです。
 */
interface Props {

  /**
   * 本文が変更されたときに呼ばれます。
   */
  onChange: (value: string) => void;

  /**
   * Firestore に保存されている本文です。
   *
   * BlockNote の JSON を文字列として保存しています。
   */
  initialContent?: string | null;

}

/**
 * 保存されているJSON文字列を
 * BlockNote が扱える形式へ変換します。
 *
 * JSONが壊れている場合は
 * undefined を返して空のエディタを表示します。
 */
const parseInitialContent = (
  initialContent?: string | null,
) => {

  if (!initialContent) {
    return undefined;
  }

  try {
    return JSON.parse(
      initialContent,
    );
  } catch (error) {
    console.error(
      '本文の読み込みに失敗しました。',
      error,
    );
    return undefined;
  }
};

/**
 * ノート本文を編集するエディタです。
 *
 * BlockNote を利用して
 * リッチテキストを編集できます。
 */
export function Editor({
  onChange,
  initialContent,
}: Props) {

  /**
   * BlockNote エディタを作成します。
   */
  const editor =
    useCreateBlockNote({

      /**
       * 日本語化
       */
      dictionary: ja,

      /**
       * 初期本文
       */
      initialContent:
        parseInitialContent(
          initialContent,
        ),
    });

  /**
   * 本文が変更されたとき
   */
  const handleChange = () => {
    /**
     * BlockNote の内容を
     * JSON文字列へ変換して
     * 親コンポーネントへ渡します。
     */
    onChange(
      JSON.stringify(
        editor.document,
      ),
    );
  };

  return (
    <div>
      <BlockNoteView
        editor={editor}
        onChange={
          handleChange
        }
      />
    </div>
  );
}