import type { HTMLAttributes } from 'react';
import { cx } from '../../../utils/classNames';
import './SkeletonCard.css';

export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {}

export function SkeletonCard({ className, ...rest }: SkeletonCardProps) {
  return (
    <div
      {...rest}
      className={cx('skeleton-card', className)}
      aria-hidden="true"
      data-testid="skeleton-card"
    >
      <div className="skeleton-card__art" />
      <div className="skeleton-card__line skeleton-card__line--short" />
      <div className="skeleton-card__line" />
    </div>
  );
}
