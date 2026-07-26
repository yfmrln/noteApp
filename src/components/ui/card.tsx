import type { HTMLAttributes } from 'react';
import '../../styles/components/card.css';

/**
 * Cardコンポーネントで使用する共通のPropsです。
 *
 * HTMLのdivタグで使用できる属性
 * (classNameやonClickなど)をそのまま利用できます。
 */
type CardProps = HTMLAttributes<HTMLDivElement>;

/**
 * カード全体を囲むコンポーネントです。
 */
export function Card({
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * カード上部(タイトルなど)を表示します。
 */
export function CardHeader({
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`card-header ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * カードタイトルを表示します。
 */
export function CardTitle({
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`card-title ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * タイトルの補足説明を表示します。
 */
export function CardDescription({
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`card-description ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * カードの本文を表示します。
 */
export function CardContent({
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`card-content ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * カード下部(ボタンなど)を表示します。
 */
export function CardFooter({
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`card-footer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}