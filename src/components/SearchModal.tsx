import { useDebouncedCallback } from 'use-debounce';
import type { Note } from '../modules/notes/note.entity';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onKeywordChange: (keyword: string) => void;
  onItemSelect: (noteId: number) => void;
}

// このコンポーネントは検索用のモーダルです。
// 入力したキーワードに合うノートを探して、選択するとそのノート詳細へ移動します。
export default function SearchModal({ 
  isOpen, 
  onClose,
  notes,
  onKeywordChange,
  onItemSelect,
}: Props) {
  const debounced = useDebouncedCallback(onKeywordChange, 500);

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder={'キーワードで検索'}
          onValueChange={debounced}
        />
        <CommandList>
          <CommandEmpty>条件に一致するノートがありません</CommandEmpty>
          <CommandGroup>
            {notes.map((note) => (
              <CommandItem 
                key={note.id} 
                title={note.title ?? '無題'}
                onSelect={() => onItemSelect(note.id)}
              >
                <span>{note.title ?? '無題'}</span>
              </CommandItem>           
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
