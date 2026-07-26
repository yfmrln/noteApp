import type {
  MouseEvent,
  KeyboardEvent,
  ReactElement,
} from 'react';

import type { IconType } from 'react-icons';

/**
 * Item コンポーネントへ渡されるデータです。
 */
interface ItemProps {

  /**
   * 表示する文字
   */
  label: string;

  /**
   * 左側アイコン
   */
  icon: IconType;

  /**
   * 項目クリック
   */
  onClick?: () => void;

  /**
   * アイコンクリック
   */
  onIconClick?: (
    event: MouseEvent<SVGElement>,
  ) => void;

  /**
   * 選択中かどうか
   */
  isActive?: boolean;

  /**
   * 右側へ表示する追加UI
   */
  trailingItem?: ReactElement;

}

/**
 * サイドバーやノート一覧で使用する
 * 共通の項目コンポーネントです。
 */
export default function Item({
  label,
  icon: Icon,
  onClick,
  onIconClick,
  isActive = false,
  trailingItem,
}: ItemProps) {

  /**
   * アイコン押下
   */
  const handleIconClick = (
    event: MouseEvent<SVGElement>,
  ) => {

    /**
     * 親のクリックイベントを止めます。
     *
     * これが無いと、アイコンをクリックしたときに
     * 親のdiv(項目全体)のonClickも一緒に
     * 呼ばれてしまいます。
     */
    event.stopPropagation();
    onIconClick?.(
      event,
    );
  };

  /**
   * Enterキー・Spaceキーでも
   * クリックできるようにします。
   *
   * divに role="button" を付けているだけでは
   * キーボード操作に対応しないため、
   * この処理を自前で用意する必要があります。
   */
  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {

    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      onClick?.();
    }
  };

  /**
   * ポイント：className を配列 + filter + join で組み立てます。
   *
   * 修正前は
   *   `sidebar-item ${isActive ? 'active' : ''} note-item`
   * という書き方で、isActiveがfalseのとき
   *   "sidebar-item  note-item"
   * のようにスペースが2つ連続してしまっていました。
   *
   * 配列に「必要なクラス名だけ」を入れて、
   * filter(Boolean) で空文字を取り除いてから
   * join(' ') で1つの文字列にすることで、
   * 常にきれいな1つ分のスペース区切りになります。
   */
  const itemClassName = [
    'sidebar-item',
    isActive ? 'active' : '',
    'note-item',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={itemClassName}
      role="button"
      tabIndex={0}
      onClick={() =>
        onClick?.()
      }
      onKeyDown={
        handleKeyDown
      }
      style={{
        paddingLeft: '12px',
      }}
    >
      <Icon
        className="sidebar-item-icon"
        size={18}
        onClick={
          handleIconClick
        }
      />
      <span className="sidebar-item-label">
        {label}
      </span>
      {trailingItem}
    </div>
  );
}