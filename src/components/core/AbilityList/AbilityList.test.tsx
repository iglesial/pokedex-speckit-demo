import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AbilityList } from './AbilityList';

describe('<AbilityList>', () => {
  it('renders regular abilities before hidden', () => {
    render(
      <AbilityList
        abilities={[
          { name: 'blaze', isHidden: false },
          { name: 'solar-power', isHidden: true },
        ]}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Blaze');
    expect(items[1]).toHaveTextContent('Solar Power');
    expect(items[1]).toHaveTextContent('Hidden');
  });

  it('does not render a Hidden label when there are no hidden abilities', () => {
    render(<AbilityList abilities={[{ name: 'overgrow', isHidden: false }]} />);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('title-cases kebab-case ability names', () => {
    render(<AbilityList abilities={[{ name: 'lightning-rod', isHidden: false }]} />);
    expect(screen.getByText('Lightning Rod')).toBeInTheDocument();
  });
});
