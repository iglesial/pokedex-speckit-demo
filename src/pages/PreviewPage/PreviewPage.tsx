import { useState } from 'react';
import { TypeBadge } from '../../components/core/TypeBadge/TypeBadge';
import { SkeletonCard } from '../../components/core/SkeletonCard/SkeletonCard';
import { Card } from '../../components/core/Card/Card';
import { CatalogGrid } from '../../components/core/CatalogGrid/CatalogGrid';
import { Pagination } from '../../components/core/Pagination/Pagination';
import { ErrorState } from '../../components/core/ErrorState/ErrorState';
import { SearchInput } from '../../components/core/SearchInput/SearchInput';
import { EmptyState } from '../../components/core/EmptyState/EmptyState';
import { TypeFilterChip } from '../../components/core/TypeFilterChip/TypeFilterChip';
import { TypeFilterBar } from '../../components/core/TypeFilterBar/TypeFilterBar';
import { TYPE_LIST } from '../../config/catalog';
import type { PokemonSummary, PokemonType } from '../../types/pokemon';

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
  const [searchValue, setSearchValue] = useState('');
  const [filterValue, setFilterValue] = useState<Set<PokemonType>>(new Set());
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
      <h1 style={{ marginBottom: 32 }}>Component Preview</h1>

      <Section title="SearchInput · empty / with query">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SearchInput value={searchValue} onChange={setSearchValue} />
          <SearchInput value="pikachu" onChange={() => {}} />
        </div>
      </Section>

      <Section title="TypeFilterChip · inactive / active / disabled">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <TypeFilterChip type="fire" active={false} onToggle={() => {}} />
          <TypeFilterChip type="fire" active onToggle={() => {}} />
          <TypeFilterChip type="fire" active={false} disabled onToggle={() => {}} />
        </div>
      </Section>

      <Section title="TypeFilterBar · interactive (reset appears when any active)">
        <TypeFilterBar active={filterValue} onChange={setFilterValue} />
      </Section>

      <Section title="EmptyState · search-only / filter-only / combined">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <EmptyState
            title={'No Pokémon match "zzz".'}
            description="Try a different name or National Dex ID."
            actionLabel="Clear search"
            onAction={() => {}}
          />
          <EmptyState
            title="No Gen 1 Pokémon combine those types."
            actionLabel="Clear filters"
            onAction={() => {}}
          />
          <EmptyState
            title="No Pokémon match your search and filters."
            description="Try clearing one to see more results."
            actionLabel="Reset all"
            onAction={() => {}}
          />
        </div>
      </Section>

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
  );
}
