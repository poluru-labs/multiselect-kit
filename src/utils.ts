import type { MsOption, MsOptionValue } from './types.js';

let seq = 0;

export function uid(prefix = 'ms'): string {
  seq += 1;
  return `${prefix}-${seq.toString(36)}`;
}

export function parseBoolean(value: string | null, fallback: boolean): boolean {
  if (value === null) return fallback;
  if (value === 'false' || value === '0') return false;
  return true;
}

export function parseValueAttr(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function normalizeValue(
  value: string | string[] | null | undefined,
  multiple: boolean,
): string[] {
  if (value == null || value === '') return [];
  const list = Array.isArray(value) ? value : [value];
  const unique = [...new Set(list.map(String).filter(Boolean))];
  return multiple ? unique : unique.slice(0, 1);
}

export function serializeValues(values: string[], multiple: boolean): string | string[] | null {
  if (multiple) return [...values];
  return values[0] ?? null;
}

export function filterOptions(
  options: MsOption[],
  query: string,
  selected: Set<string>,
  hideSelected: boolean,
): MsOption[] {
  const q = query.trim().toLowerCase();
  return options.filter((option) => {
    if (hideSelected && selected.has(option.value)) return false;
    if (!q) return true;
    const haystack = `${option.label} ${option.description ?? ''} ${option.group ?? ''}`.toLowerCase();
    return haystack.includes(q);
  });
}

export interface OptionGroup {
  name: string | null;
  options: MsOption[];
}

export function groupOptions(options: MsOption[]): OptionGroup[] {
  const order: string[] = [];
  const map = new Map<string, MsOption[]>();

  for (const option of options) {
    const key = option.group ?? '';
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(option);
  }

  return order.map((key) => ({
    name: key || null,
    options: map.get(key)!,
  }));
}

export function findOption(options: MsOption[], value: MsOptionValue): MsOption | undefined {
  return options.find((option) => option.value === value);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function nextEnabledIndex(
  options: MsOption[],
  start: number,
  direction: 1 | -1,
): number {
  if (!options.length) return -1;
  let i = start;
  for (let n = 0; n < options.length; n += 1) {
    i = (i + direction + options.length) % options.length;
    if (!options[i]?.disabled) return i;
  }
  return options.findIndex((option) => !option.disabled);
}
