import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MsMultiselect } from './ms-multiselect.js';
import { defineMultiselect } from './register.js';
import type { MsChangeDetail, MsOption } from './types.js';

defineMultiselect();

const OPTIONS: MsOption[] = [
  { value: 'apple', label: 'Apple', group: 'Fruit' },
  { value: 'banana', label: 'Banana', group: 'Fruit' },
  { value: 'cherry', label: 'Cherry', group: 'Fruit', disabled: true },
  { value: 'carrot', label: 'Carrot', group: 'Vegetable', description: 'Orange root' },
];

function mount(attrs: Record<string, string> = {}): MsMultiselect {
  const el = document.createElement('ms-multiselect') as MsMultiselect;
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  document.body.append(el);
  el.options = OPTIONS;
  return el;
}

function inputOf(el: MsMultiselect): HTMLInputElement {
  return el.shadowRoot!.querySelector('input')!;
}

function listboxOf(el: MsMultiselect): HTMLElement {
  return el.shadowRoot!.querySelector('[part="listbox"]')!;
}

function optionEls(el: MsMultiselect): HTMLElement[] {
  return [...el.shadowRoot!.querySelectorAll<HTMLElement>('[role="option"]')];
}

describe('ms-multiselect', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('registers the custom element', () => {
    expect(customElements.get('ms-multiselect')).toBe(MsMultiselect);
  });

  it('selects and deselects values via methods', () => {
    const el = mount();
    el.select('apple');
    el.select('banana');
    expect(el.getValue()).toEqual(['apple', 'banana']);
    el.deselect('apple');
    expect(el.getValue()).toEqual(['banana']);
  });

  it('does not select disabled options', () => {
    const el = mount();
    el.select('cherry');
    expect(el.getValue()).toEqual([]);
  });

  it('emits change with selected options', () => {
    const el = mount();
    let detail: MsChangeDetail | undefined;
    el.addEventListener('change', (event) => {
      detail = (event as CustomEvent<MsChangeDetail>).detail;
    });
    el.select('carrot');
    expect(detail?.value).toEqual(['carrot']);
    expect(detail?.selectedOptions[0]?.label).toBe('Carrot');
  });

  it('respects maxSelected', () => {
    const el = mount({ 'max-selected': '1' });
    el.select('apple');
    el.select('banana');
    expect(el.getValue()).toEqual(['apple']);
  });

  it('supports single-select mode', () => {
    const el = mount({ multiple: 'false' });
    el.select('apple');
    el.select('banana');
    expect(el.getValue()).toBe('banana');
  });

  it('clears the selection', () => {
    const el = mount();
    el.select('apple');
    el.clear();
    expect(el.getValue()).toEqual([]);
  });

  it('exposes combobox / listbox ARIA roles', () => {
    const el = mount({ label: 'Produce' });
    const input = inputOf(el);
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-haspopup')).toBe('listbox');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(listboxOf(el).getAttribute('role')).toBe('listbox');
    expect(input.getAttribute('aria-label')).toBe('Produce');
  });

  it('opens on ArrowDown and moves the active option', () => {
    const el = mount();
    const input = inputOf(el);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(el.open).toBe(true);
    expect(listboxOf(el).classList.contains('is-open')).toBe(true);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(optionEls(el).some((node) => node.classList.contains('is-active'))).toBe(true);
  });

  it('toggles the active option with Enter', () => {
    const el = mount();
    const input = inputOf(el);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect((el.getValue() as string[]).length).toBe(1);
  });

  it('filters options while typing and emits search', () => {
    const el = mount();
    const queries: string[] = [];
    el.addEventListener('search', (event) => {
      queries.push((event as CustomEvent<{ query: string }>).detail.query);
    });
    const input = inputOf(el);
    input.focus();
    input.value = 'car';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(queries).toEqual(['car']);
    expect(optionEls(el).map((node) => node.dataset.value)).toEqual(['carrot']);
  });

  it('renders group labels', () => {
    const el = mount();
    el.show();
    const labels = [...el.shadowRoot!.querySelectorAll('[part="group-label"]')].map(
      (node) => node.textContent,
    );
    expect(labels).toEqual(['Fruit', 'Vegetable']);
  });

  it('shows a loading state', () => {
    const el = mount({ loading: '' });
    el.show();
    expect(el.shadowRoot!.querySelector('[part="loading"]')?.textContent).toContain('Loading');
  });

  it('shows an empty state when nothing matches', () => {
    const el = mount();
    const input = inputOf(el);
    input.value = 'zzzz';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.shadowRoot!.querySelector('[part="empty"]')?.textContent).toContain('No results');
  });

  it('removes a selected chip with its accessible button', () => {
    const el = mount();
    el.select('apple');
    const remove = el.shadowRoot!.querySelector<HTMLButtonElement>('[data-remove="apple"]');
    expect(remove?.getAttribute('aria-label')).toBe('Remove Apple');
    remove?.click();
    expect(el.getValue()).toEqual([]);
  });

  it('focus() moves focus into the combobox input', () => {
    const el = mount();
    el.focus();
    expect(el.shadowRoot!.activeElement).toBe(inputOf(el));
  });
});
