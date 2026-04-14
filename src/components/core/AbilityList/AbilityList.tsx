import type { PokemonAbility } from '../../../types/pokemon';
import './AbilityList.css';

export interface AbilityListProps {
  abilities: PokemonAbility[];
}

function titleCase(name: string): string {
  return name
    .split('-')
    .map((s) => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}

export function AbilityList({ abilities }: AbilityListProps) {
  const regular = abilities.filter((a) => !a.isHidden);
  const hidden = abilities.filter((a) => a.isHidden);
  return (
    <div className="ability-list">
      <ul className="ability-list__items">
        {regular.map((a) => (
          <li key={a.name} className="ability-list__item">
            {titleCase(a.name)}
          </li>
        ))}
        {hidden.map((a) => (
          <li key={a.name} className="ability-list__item ability-list__item--hidden">
            <span>{titleCase(a.name)}</span>
            <span className="ability-list__hidden-label">Hidden</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
