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

/**
 * SearchModalへ渡すデータです。
 */
interface Props {

  /**
   * モーダルを開くかどうか
   */
  isOpen: boolean;

  /**
   * モーダルを閉じます。
   */
  onClose: () => void;

  /**
   * 検索結果一覧
   */
  notes: Note[];

  /**
   * キーワード変更時
   */
  onKeywordChange: (
    keyword: string,
  ) => void;

  /**
   * ノート選択時
   */
  onItemSelect: (
    noteId: string,
  ) => void;
}

/**
 * ノート検索モーダルです。
 *
 * Firestoreから取得したノートを検索し、
 * 選択されたノートへ移動します。
 */
export default function SearchModal({
  isOpen,
  onClose,
  notes,
  onKeywordChange,
  onItemSelect,
}: Props) {

  /**
   * 入力が止まってから500ms後に検索します。
   *
   * Firestoreへ毎文字アクセスしないようにしています。
   */
  const handleKeywordChange =
    useDebouncedCallback(
      onKeywordChange,
      500,
    );

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="キーワードで検索"
          onValueChange={handleKeywordChange}
        />
        <CommandList>
          <CommandEmpty>
            条件に一致するノートがありません
          </CommandEmpty>
          <CommandGroup>
            {notes.map((note) => (

              <CommandItem
                key={note.id}
                value={note.id}
                onSelect={() => onItemSelect(note.id)}
              >
                {note.title ?? '無題'}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}