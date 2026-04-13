import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CatalogGrid } from './CatalogGrid';

describe('<CatalogGrid>', () => {
  it('renders children', () => {
    const { getByText, container } = render(
      <CatalogGrid>
        <div>child-1</div>
        <div>child-2</div>
      </CatalogGrid>,
    );
    expect(getByText('child-1')).toBeInTheDocument();
    expect(getByText('child-2')).toBeInTheDocument();
    expect(container.querySelector('.catalog-grid')).toBeTruthy();
  });
});
