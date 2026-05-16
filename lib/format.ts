// Format large numbers: 1000 → 1K, 30000 → 30K, 1500 → 1.5K
export function fmtNum(n: number, prefix = ''): string {
  if (n >= 1000000) return `${prefix}${(n / 1000000).toFixed(1).replace('.0', '')}M`;
  if (n >= 1000) return `${prefix}${(n / 1000).toFixed(1).replace('.0', '')}K`;
  return `${prefix}${n}`;
}

export function fmtMoney(n: number): string {
  return fmtNum(n, '$');
}
