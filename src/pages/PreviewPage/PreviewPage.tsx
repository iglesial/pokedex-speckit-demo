import { MemoryRouter } from 'react-router-dom';
import { TypeBadge } from '../../components/core/TypeBadge/TypeBadge';
import { SkeletonCard } from '../../components/core/SkeletonCard/SkeletonCard';
import { Card } from '../../components/core/Card/Card';
import { CatalogGrid } from '../../components/core/CatalogGrid/CatalogGrid';
import { Pagination } from '../../components/core/Pagination/Pagination';
import { ErrorState } from '../../components/core/ErrorState/ErrorState';
import { TYPE_LIST } from '../../config/catalog';
import type { PokemonSummary } from '../../types/pokemon';

const pikachu: PokemonSummary = {
  id: 25, name: 'pikachu', types: ['electric'], spriteUrl: null,
};
const charizard: PokemonSummary = {
  id: 6, name: 'charizard', types: ['fire', 'flying'], spriteUrl: null,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 18, marginBottom: 16, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</h2>
      {children}
    </section>
  );
}

export function PreviewPage() {
  return (
    <MemoryRouter>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
        <h1 style={{ marginBottom: 32 }}>Component Preview</h1>

        <Section title="TypeBadge · all 18 types">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPE_LIST.map((t) => <TypeBadge key={t} type={t} />)}
          </div>
        </Section>

        <Section title="SkeletonCard">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 600 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </Section>

        <Section title="Card · default / loading">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 600 }}>
            <Card pokemon={pikachu} />
            <Card pokemon={charizard} />
            <Card pokemon={pikachu} loading />
          </div>
        </Section>

        <Section title="CatalogGrid">
          <CatalogGrid>
            <Card pokemon={pikachu} />
            <Card pokemon={charizard} />
            <Card pokemon={pikachu} />
          </CatalogGrid>
        </Section>

        <Section title="Pagination · first / middle / last / elided / single-page">
          <Pagination page={1} totalPages={7} onChange={() => {}} />
          <Pagination page={4} totalPages={7} onChange={() => {}} />
          <Pagination page={7} totalPages={7} onChange={() => {}} />
          <Pagination page={10} totalPages={20} onChange={() => {}} />
          <Pagination page={1} totalPages={1} onChange={() => {}} />
        </Section>

        <Section title="ErrorState">
          <ErrorState onRetry={() => {}} />
        </Section>
      </div>
    </MemoryRouter>
  );
}
