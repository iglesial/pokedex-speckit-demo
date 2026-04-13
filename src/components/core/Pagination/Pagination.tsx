import { cx } from '../../../utils/classNames';
import './Pagination.css';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
  ariaLabel?: string;
}

function pageList(page: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push('ellipsis');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onChange, ariaLabel }: PaginationProps) {
  if (totalPages <= 1) return null;
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <nav className="pagination" aria-label={ariaLabel ?? 'Catalog pagination'}>
      <button
        type="button"
        className="pagination__btn"
        disabled={!canPrev}
        onClick={() => canPrev && onChange(page - 1)}
        aria-label="Previous page"
      >
        ‹ Prev
      </button>
      <ol className="pagination__pages">
        {pageList(page, totalPages).map((p, i) =>
          p === 'ellipsis' ? (
            <li key={`e-${i}`} className="pagination__ellipsis" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className={cx(
                  'pagination__page',
                  p === page && 'pagination__page--active',
                )}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ol>
      <button
        type="button"
        className="pagination__btn"
        disabled={!canNext}
        onClick={() => canNext && onChange(page + 1)}
        aria-label="Next page"
      >
        Next ›
      </button>
    </nav>
  );
}
