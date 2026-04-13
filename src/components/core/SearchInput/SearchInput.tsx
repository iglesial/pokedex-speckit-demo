import { forwardRef, type KeyboardEvent } from 'react';
import { cx } from '../../../utils/classNames';
import './SearchInput.css';

export interface SearchInputProps {
  value: string;
  onChange: (next: string) => void;
  onArrowDown?: () => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { value, onChange, onArrowDown, placeholder = 'Search by name or ID…', label = 'Search Pokémon', className },
    ref,
  ) {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown' && onArrowDown) {
        e.preventDefault();
        onArrowDown();
      }
    };
    return (
      <div className={cx('search-input', className)}>
        <label className="search-input__label" htmlFor="catalog-search">
          {label}
        </label>
        <div className="search-input__wrap">
          <svg
            className="search-input__icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" />
          </svg>
          <input
            ref={ref}
            id="catalog-search"
            type="search"
            className="search-input__field"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
          />
          {value !== '' && (
            <button
              type="button"
              className="search-input__clear"
              aria-label="Clear input"
              onClick={() => onChange('')}
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  },
);
