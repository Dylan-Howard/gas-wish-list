import type { WishItem } from './types';

// ─── Tag Color Palette ────────────────────────────────────────────────────────
// 8 muted, refined color pairs

export interface TagColor {
  bg: string;
  text: string;
  border: string;
}

export const TAG_PALETTE: TagColor[] = [
  { bg: '#EDF7ED', text: '#2D6A30', border: '#C3E6C5' }, // sage
  { bg: '#EBF4FB', text: '#1B5E8C', border: '#BDD7EF' }, // sky
  { bg: '#FCF0F0', text: '#9B2335', border: '#F2C4C4' }, // rose
  { bg: '#FDF6E3', text: '#7D5A00', border: '#F0DCA0' }, // amber
  { bg: '#F3EFFE', text: '#5B3DC8', border: '#D4C4F5' }, // lavender
  { bg: '#FEF3ED', text: '#9B4215', border: '#F5C9A8' }, // peach
  { bg: '#E8F7F5', text: '#1A6B5F', border: '#B5E0D8' }, // teal
  { bg: '#F5EEF8', text: '#6C3483', border: '#D7BFE8' }, // plum
];

/** Deterministically assigns a color to a tag string. */
export function getTagColor(tag: string): TagColor {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash << 5) - hash + tag.charCodeAt(i);
    hash |= 0; // force 32-bit int
  }
  return TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length];
}

// ─── Price ───────────────────────────────────────────────────────────────────

export function formatPrice(
  price: number | undefined,
  currency: string = 'USD'
): string {
  if (price === undefined || price === null) return '';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

// ─── ID Generation ───────────────────────────────────────────────────────────

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export function getAllTags(items: WishItem[]): string[] {
  const tagSet = new Set<string>();
  items.forEach(item => item.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

// ─── Date ────────────────────────────────────────────────────────────────────

export function now(): string {
  return new Date().toISOString();
}
