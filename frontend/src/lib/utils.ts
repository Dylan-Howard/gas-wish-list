// ── Tag color palettes ──────────────────────────────────────────────────────────
const TAG_PALETTES = [
  { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' }, // sky
  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' }, // green
  { bg: '#FAF5FF', text: '#9333EA', border: '#E9D5FF' }, // purple
  { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' }, // orange
  { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' }, // rose
  { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' }, // emerald
  { bg: '#FEFCE8', text: '#A16207', border: '#FEF08A' }, // yellow
  { bg: '#F0F9FF', text: '#0284C7', border: '#BAE6FD' }, // light blue
  { bg: '#FDF4FF', text: '#A21CAF', border: '#F0ABFC' }, // fuchsia
  { bg: '#F8FAFC', text: '#475569', border: '#CBD5E1' }, // slate
];

/**
 * Returns a deterministic background/text/border color tuple for a tag string.
 * Same tag string always yields the same color.
 */
export function getTagColor(tag: string): {
  bg: string;
  text: string;
  border: string;
} {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // convert to 32-bit int
  }
  return TAG_PALETTES[Math.abs(hash) % TAG_PALETTES.length];
}

// ── Price formatting ────────────────────────────────────────────────────────────
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(price?: number): string {
  if (price === undefined || price === null) return '';
  return priceFormatter.format(price);
}

// ── ID generation ───────────────────────────────────────────────────────────────
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Date formatting ─────────────────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ── String helpers ──────────────────────────────────────────────────────────────
export function truncate(str: string, maxLen: number): string {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '…';
}
