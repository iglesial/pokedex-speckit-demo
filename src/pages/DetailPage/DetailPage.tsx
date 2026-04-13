import { Link, useParams } from 'react-router-dom';

export function DetailPage() {
  const { id } = useParams();
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <p style={{ color: 'var(--fg-muted)' }}>Detail page stub</p>
      <h1>Pokémon #{id}</h1>
      <p>Full detail page is feature 003.</p>
      <Link to="/">← Back to catalog</Link>
    </div>
  );
}
