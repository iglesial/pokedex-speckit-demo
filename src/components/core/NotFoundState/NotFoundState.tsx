import { Link } from 'react-router-dom';
import './NotFoundState.css';

export interface NotFoundStateProps {
  id?: string | number;
}

export function NotFoundState({ id }: NotFoundStateProps) {
  const heading =
    id !== undefined && id !== ''
      ? `No Pokémon with ID ${id}`
      : 'No Pokémon found';
  return (
    <div className="not-found-state" role="status">
      <div className="not-found-state__glyph" aria-hidden="true">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 12 A 9 9 0 0 1 8 20" />
        </svg>
      </div>
      <h2 className="not-found-state__title">{heading}</h2>
      <p className="not-found-state__description">
        Only Generation 1 Pokémon (IDs 1–151) are available in this Pokédex.
      </p>
      <Link className="not-found-state__link" to="/">
        Back to catalog
      </Link>
    </div>
  );
}
