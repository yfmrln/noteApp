import { ja } from "@blocknote/core/locales";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import '@blocknote/mantine/style.css';

// このコンポーネントはノート本文を入力するためのエディタです。
// BlockNote を使って、見出しや段落などを扱いやすい形式で保存します。
interface Props {
    onChange: (value: string) => void;
    initialContent?: string | null;
}

export function Editor({ onChange, initialContent }: Props) {
    const editor = useCreateBlockNote({ 
        dictionary: ja, 
        initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    });

    return (
        <div>
            <BlockNoteView 
                editor={editor}
                onChange={() => onChange(JSON.stringify(editor.document))} 
            />
        </div>
    );
}