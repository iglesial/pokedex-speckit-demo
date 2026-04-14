import { describe, it, expect } from 'vitest';
import { normalizeFlavor } from './normalizeFlavor';

describe('normalizeFlavor', () => {
  it('strips form-feed characters', () => {
    expect(normalizeFlavor('A\fspits fire')).toBe('A spits fire');
  });
  it('strips non-breaking spaces', () => {
    expect(normalizeFlavor('It\u00A0has\u00A0flames')).toBe('It has flames');
  });
  it('strips soft hyphens entirely', () => {
    expect(normalizeFlavor('Char\u00ADizard')).toBe('Charizard');
  });
  it('normalizes newlines to spaces', () => {
    expect(normalizeFlavor('A\nB\r\nC')).toBe('A B C');
  });
  it('collapses consecutive whitespace', () => {
    expect(normalizeFlavor('too    many     spaces')).toBe('too many spaces');
  });
  it('preserves single spaces', () => {
    expect(normalizeFlavor('a normal sentence.')).toBe('a normal sentence.');
  });
  it('trims leading and trailing whitespace', () => {
    expect(normalizeFlavor('  hi  ')).toBe('hi');
  });
});
