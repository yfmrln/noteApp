import { useEffect, useState } from 'react';

import type { Note } from '../modules/notes/note.entity';

/**
 * TitleInput コンポーネントへ渡されるデータです。
 */
interface Props {

  /**
   * 編集対象のノート
   */
  initialData: Note;

  /**
   * タイトル変更時に呼ばれます。
   */
  onTitleChange: (
    value: string,
  ) => void;

}

/**
 * ノートタイトルを編集する入力欄です。
 *
 * 入力されたタイトルは
 * 親コンポーネントへ通知します。
 */
export default function TitleInput({
  initialData,
  onTitleChange,
}: Props) {

  /**
   * 入力欄に表示するタイトルです。
   */
  const [
    value,
    setValue,
  ] = useState(
    initialData.title ?? '無題',
  );

  /**
   * 編集対象のノートが切り替わったら、
   * 入力欄も最新タイトルへ更新します。
   *
   * useState() は初回しか実行されないため、
   * useEffect() で同期しています。
   */
  useEffect(() => {

    setValue(
      initialData.title ?? '無題',
    );

  }, [
    initialData.id,
    initialData.title,
  ]);

  /**
   * タイトル変更
   */
  const handleInputChange = (
    newValue: string,
  ) => {

    /**
     * 入力欄を更新
     */
    setValue(
      newValue,
    );

    /**
     * 親コンポーネントへ通知
     */
    onTitleChange(
      newValue,
    );
  };

  return (

    <div className="title-input-container">
      <textarea
        className="title-input"
        value={value}
        placeholder="無題"
        onChange={(event) =>
          handleInputChange(
            event.target.value,
          )
        }
      />
    </div>
  );
}