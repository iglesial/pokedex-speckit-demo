import type { HTMLAttributes } from 'react';
import { cx } from '../../../utils/classNames';
import './CatalogGrid.css';

export interface CatalogGridProps extends HTMLAttributes<HTMLDivElement> {}

export function CatalogGrid({ className, children, ...rest }: CatalogGridProps) {
  return (
    <div {...rest} className={cx('catalog-grid', className)}>
      {children}
    </div>
  );
}
