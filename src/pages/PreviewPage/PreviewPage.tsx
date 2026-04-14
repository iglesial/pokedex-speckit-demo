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
import { StatBar } from '../../components/core/StatBar/StatBar';
import { AbilityList } from '../../components/core/AbilityList/AbilityList';
import { DetailHero } from '../../components/core/DetailHero/DetailHero';
import { SkeletonDetail } from '../../components/core/SkeletonDetail/SkeletonDetail';
import { BackButton } from '../../components/core/BackButton/BackButton';
import { NotFoundState } from '../../components/core/NotFoundState/NotFoundState';
import { EvolutionStage } from '../../components/core/EvolutionStage/EvolutionStage';
import { EvolutionEdge } from '../../components/core/EvolutionEdge/EvolutionEdge';
import { SkeletonEvolution } from '../../components/core/SkeletonEvolution/SkeletonEvolution';
import type { EvolutionStage as EvoStageModel } from '../../types/pokemon';
import { TYPE_LIST } from '../../config/catalog';
import type { PokemonSummary, PokemonType, PokemonDetail } from '../../types/pokemon';

const pikachu: PokemonSummary = {
  id: 25, name: 'pikachu', types: ['electric'], spriteUrl: null,
};
const charizard: PokemonSummary = {
  id: 6, name: 'charizard', types: ['fire', 'flying'], spriteUrl: null,
};

const charizardDetail: PokemonDetail = {
  id: 6, name: 'charizard', types: ['fire', 'flying'],
  artworkUrl: null,
  stats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
  heightDecimetres: 17, weightHectograms: 905,
  abilities: [
    { name: 'blaze', isHidden: false },
    { name: 'solar-power', isHidden: true },
  ],
  flavorText: 'Spits fire that is hot enough to melt boulders.',
  evolutionChainId: 2,
};
const bulbasaurDetail: PokemonDetail = {
  id: 1, name: 'bulbasaur', types: ['grass'],
  artworkUrl: null,
  stats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
  heightDecimetres: 7, weightHectograms: 69,
  abilities: [{ name: 'overgrow', isHidden: false }],
  flavorText: null,
  evolutionChainId: 1,
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

      <Section title="DetailHero · 1 type / 2 types">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <DetailHero pokemon={bulbasaurDetail} />
          <DetailHero pokemon={charizardDetail} />
        </div>
      </Section>

      <Section title="StatBar · low / mid / high / clamped / zero">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
          <StatBar label="HP" value={0} />
          <StatBar label="Attack" value={45} />
          <StatBar label="Defense" value={75} />
          <StatBar label="Sp. Atk" value={150} />
          <StatBar label="Speed" value={300} />
        </div>
      </Section>

      <Section title="AbilityList · regular only / regular + hidden / all hidden">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 420 }}>
          <AbilityList abilities={[{ name: 'overgrow', isHidden: false }]} />
          <AbilityList abilities={[
            { name: 'blaze', isHidden: false },
            { name: 'solar-power', isHidden: true },
          ]} />
          <AbilityList abilities={[
            { name: 'synchronize', isHidden: true },
          ]} />
        </div>
      </Section>

      <Section title="SkeletonDetail">
        <SkeletonDetail />
      </Section>

      <Section title="BackButton · default / custom label">
        <div style={{ display: 'flex', gap: 16 }}>
          <BackButton />
          <BackButton label="Home" />
        </div>
      </Section>

      <Section title="NotFoundState · default / with id">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <NotFoundState />
          <NotFoundState id="999" />
        </div>
      </Section>

      <Section title="EvolutionStage · default / current / null-sprite">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {([
            { pokemonId: 1, name: 'bulbasaur', spriteUrl: 'https://img.pokemondb.net/artwork/bulbasaur.jpg', isCurrent: false },
            { pokemonId: 2, name: 'ivysaur', spriteUrl: 'https://img.pokemondb.net/artwork/ivysaur.jpg', isCurrent: true },
            { pokemonId: 3, name: 'venusaur', spriteUrl: null, isCurrent: false },
          ] as EvoStageModel[]).map((s, i) => (
            <EvolutionStage key={s.pokemonId} stage={s} index={i} />
          ))}
        </div>
      </Section>

      <Section title="EvolutionEdge · labeled / unlabeled / horizontal / vertical">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <EvolutionEdge triggerLabel="Lv. 16" accessibleLabel="evolves at level 16" orientation="horizontal" />
          <EvolutionEdge triggerLabel="Fire Stone" accessibleLabel="evolves when given Fire Stone" orientation="horizontal" />
          <EvolutionEdge triggerLabel="Friendship" accessibleLabel="evolves with high friendship" orientation="horizontal" />
          <EvolutionEdge triggerLabel={null} accessibleLabel={null} orientation="horizontal" />
          <EvolutionEdge triggerLabel="Lv. 25" accessibleLabel="evolves at level 25" orientation="vertical" />
        </div>
      </Section>

      <Section title="SkeletonEvolution">
        <SkeletonEvolution />
      </Section>
    </div>
  );
}
