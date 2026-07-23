import { useState } from "react";
import type { Note } from "../modules/notes/note.entity";

interface Props {
  initialData: Note;
  onTitleChange: (value: string) => void;
}

// このコンポーネントはノートのタイトル入力欄です。
// 入力内容をそのまま親コンポーネントへ渡して、保存処理に使えるようにします。
export default function TitleInput({ initialData, onTitleChange }: Props) {
  const [value, setValue] = useState(initialData.title ?? '無題');

  const handleInputChange = (value: string) => {
    setValue(value);
    onTitleChange(value);
  };

  return (
    <div className='title-input-container'>
      <textarea 
        className='title-input' 
        value={value} 
        onChange={(e) => handleInputChange(e.target.value)} 
      />
    </div>
  );
}
