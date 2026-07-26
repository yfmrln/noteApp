import { useState, type MouseEvent } from 'react';
import type { IconType } from 'react-icons';

import {
  FiChevronDown,
  FiChevronRight,
  FiFile,
  FiMoreHorizontal,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import Item from '../SideBar/Item';

import type { Note } from '../../modules/notes/note.entity';

/**
 * コンポーネントへ渡されるデータ
 */
interface Props {

  /**
   * 表示するノート
   */
  note: Note;

  /**
   * 子ノート作成
   */
  onCreate?: (
    event: MouseEvent,
  ) => void;

  /**
   * 子ノート展開
   */
  onExpand?: (
    event: MouseEvent,
  ) => void;

  /**
   * 階層
   */
  layer?: number;

  /**
   * 展開中かどうか
   */
  expanded?: boolean;

  /**
   * ノートクリック
   */
  onClick: () => void;

  /**
   * ノート削除
   */
  onDelete?: (
    event: MouseEvent,
  ) => void;

}

/**
 * ノート一覧の1件分を表示するコンポーネントです。
 *
 * ・タイトル表示
 * ・子ノート作成
 * ・展開／折りたたみ
 * ・削除
 *
 * を担当します。
 */
export default function NoteItem({
  note,
  onCreate,
  onExpand,
  layer = 0,
  expanded = false,
  onClick,
  onDelete,
}: Props) {

  /**
   * マウスが乗っているか
   */
  const [
    isHovered,
    setIsHovered,
  ] = useState(false);

  /**
   * ノート左側に表示するアイコンを決定します。
   */
  const getIcon = (): IconType => {

    if (expanded) {
      return FiChevronDown;
    }

    if (isHovered) {
      return FiChevronRight;
    }

    return FiFile;

  };

  /**
   * 右側メニュー
   */
  const menu = (
    <div className="note-item-menu-container">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className="note-item-menu-button"
            role="button"
          >
            <FiMoreHorizontal
              className="note-item-menu-icon"
              size={16}
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="note-item-dropdown"
          align="start"
          side="right"
          forceMount
        >
          <DropdownMenuItem
            onClick={onDelete}
          >
            <FiTrash2
              className="note-item-delete-icon"
              size={16}
            />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div
        className="note-item-menu-button"
        role="button"
        onClick={onCreate}
      >
        <FiPlus
          className="note-item-menu-icon"
          size={16}
        />
      </div>
    </div>
  );

  return (
    <div
      role="button"
      style={{
        paddingLeft:
          `${layer * 12 + 12}px`,
      }}
      onMouseEnter={() =>
        setIsHovered(true)
      }
      onMouseLeave={() =>
        setIsHovered(false)
      }
      onClick={onClick}
    >

      <Item
        /**
         * タイトル未入力なら「無題」
         */
        label={
          note.title ?? '無題'
        }

        /**
         * 左側アイコン
         */
        icon={getIcon()}

        /**
         * 右側メニュー
         */
        trailingItem={menu}

        /**
         * 展開アイコン
         */
        onIconClick={onExpand}
      />
    </div>
  );
}