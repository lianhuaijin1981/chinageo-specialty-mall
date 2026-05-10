import { describe, expect, it } from 'vitest';
import { formatPrice, slugify } from './utils';

describe('formatPrice', () => {
  it(' should format price correctly', () => {
    expect(formatPrice(1234.56)).toBe('¥1,234.56');
    expect(formatPrice(0)).toBe('¥0.00');
    expect(formatPrice(1234567.89)).toBe('¥1,234,567.89');
  });

  it(' should handle invalid input', () => {
    expect(formatPrice(NaN)).toBe('¥0.00');
    expect(formatPrice(null as any)).toBe('¥0.00');
    expect(formatPrice(undefined as any)).toBe('¥0.00');
  });
});

describe('slugify', () => {
  it(' should convert string to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('国家地理标志产品')).toBe('国家地理标志产品');
    expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
  });

  it(' should handle empty string', () => {
    expect(slugify('')).toBe('');
  });
});
