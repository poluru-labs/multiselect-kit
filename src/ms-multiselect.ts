import { STYLES } from './styles.js';
import type {
  MsChangeDetail,
  MsOption,
  MsRenderOption,
  MsSearchDetail,
  MsValue,
} from './types.js';
import {
  clamp,
  filterOptions,
  findOption,
  groupOptions,
  nextEnabledIndex,
  normalizeValue,
  parseBoolean,
  parseValueAttr,
  serializeValues,
  uid,
} from './utils.js';

const ICONS = {
  x: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
  chevron: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>',
  check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6"/></svg>',
};

let sheet: CSSStyleSheet | undefined;

function applyStyles(shadow: ShadowRoot): void {
  if (typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype) {
    if (!sheet) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(STYLES);
    }
    shadow.adoptedStyleSheets = [sheet];
    return;
  }
  const style = document.createElement('style');
  style.textContent = STYLES;
  shadow.append(style);
}

export class MsMultiselect extends HTMLElement {
  static readonly formAssociated = true;

  static get observedAttributes(): string[] {
    return [
      'placeholder',
      'disabled',
      'loading',
      'multiple',
      'searchable',
      'clearable',
      'max-selected',
      'name',
      'value',
      'label',
      'filter',
    ];
  }

  #internals?: ElementInternals;
  #options: MsOption[] = [];
  #selected = new Set<string>();
  #open = false;
  #query = '';
  #activeIndex = -1;
  #multiple = true;
  #searchable = true;
  #clearable = true;
  #filter = true;
  #maxSelected: number | null = null;
  #placeholder = 'Select…';
  #renderOption?: MsRenderOption;
  #connected = false;
  #announceTimer = 0;

  #root!: HTMLDivElement;
  #labelEl!: HTMLDivElement;
  #control!: HTMLDivElement;
  #chips!: HTMLDivElement;
  #input!: HTMLInputElement;
  #clearBtn!: HTMLButtonElement;
  #toggleBtn!: HTMLButtonElement;
  #listbox!: HTMLDivElement;
  #toolbar!: HTMLDivElement;
  #optionsEl!: HTMLDivElement;
  #live!: HTMLDivElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    applyStyles(shadow);
    try {
      this.#internals = this.attachInternals();
    } catch {
      this.#internals = undefined;
    }
    this.#build(shadow);
  }

  connectedCallback(): void {
    if (!this.id) this.id = uid('ms-multiselect');
    this.#readAttributes();
    if (this.hasAttribute('value')) {
      this.#selected = new Set(parseValueAttr(this.getAttribute('value')));
    }
    this.#connected = true;
    this.#bind();
    this.#syncForm();
    this.#sync();
  }

  disconnectedCallback(): void {
    this.#connected = false;
    this.#unbind();
    window.clearTimeout(this.#announceTimer);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.#connected) return;
    this.#readAttributes();
    if (name === 'value') {
      this.#selected = new Set(parseValueAttr(newValue));
    }
    this.#sync();
  }

  get options(): MsOption[] {
    return this.#options.map((option) => ({ ...option }));
  }
  set options(value: MsOption[]) {
    this.#options = Array.isArray(value) ? value.map((option) => ({ ...option })) : [];
    this.#pruneSelection();
    this.#sync();
  }

  get value(): MsValue {
    return serializeValues([...this.#selected], this.#multiple);
  }
  set value(next: MsValue) {
    this.#selected = new Set(normalizeValue(next, this.#multiple));
    this.#syncForm();
    this.#reflectValueAttr();
    this.#sync();
  }

  get placeholder(): string {
    return this.#placeholder;
  }
  set placeholder(value: string) {
    this.#placeholder = value;
    this.setAttribute('placeholder', value);
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }
  set disabled(value: boolean) {
    this.toggleAttribute('disabled', Boolean(value));
  }

  get loading(): boolean {
    return this.hasAttribute('loading');
  }
  set loading(value: boolean) {
    this.toggleAttribute('loading', Boolean(value));
  }

  get multiple(): boolean {
    return this.#multiple;
  }
  set multiple(value: boolean) {
    this.#multiple = Boolean(value);
    this.setAttribute('multiple', String(this.#multiple));
    if (!this.#multiple) {
      const first = [...this.#selected][0];
      this.#selected = new Set(first ? [first] : []);
    }
    this.#sync();
  }

  get searchable(): boolean {
    return this.#searchable;
  }
  set searchable(value: boolean) {
    this.#searchable = Boolean(value);
    this.setAttribute('searchable', String(this.#searchable));
    this.#sync();
  }

  get clearable(): boolean {
    return this.#clearable;
  }
  set clearable(value: boolean) {
    this.#clearable = Boolean(value);
    this.setAttribute('clearable', String(this.#clearable));
    this.#sync();
  }

  get filter(): boolean {
    return this.#filter;
  }
  set filter(value: boolean) {
    this.#filter = Boolean(value);
    this.setAttribute('filter', String(this.#filter));
    this.#sync();
  }

  get maxSelected(): number | null {
    return this.#maxSelected;
  }
  set maxSelected(value: number | null) {
    this.#maxSelected = value == null || Number.isNaN(Number(value)) ? null : Number(value);
    if (this.#maxSelected == null) this.removeAttribute('max-selected');
    else this.setAttribute('max-selected', String(this.#maxSelected));
    this.#enforceMax();
    this.#sync();
  }

  get name(): string {
    return this.getAttribute('name') ?? '';
  }
  set name(value: string) {
    this.setAttribute('name', value);
  }

  get label(): string {
    return this.getAttribute('label') ?? '';
  }
  set label(value: string) {
    this.setAttribute('label', value);
  }

  get open(): boolean {
    return this.#open;
  }
  set open(value: boolean) {
    if (value) this.show();
    else this.hide();
  }

  get renderOption(): MsRenderOption | undefined {
    return this.#renderOption;
  }
  set renderOption(fn: MsRenderOption | undefined) {
    this.#renderOption = fn;
    this.#sync();
  }

  focus(options?: FocusOptions): void {
    this.#input.focus(options);
  }

  blur(): void {
    this.#input.blur();
  }

  show(): void {
    if (this.disabled || this.#open) return;
    this.#open = true;
    this.#activeIndex = this.#visibleOptions().findIndex((option) => this.#selected.has(option.value));
    if (this.#activeIndex < 0) this.#activeIndex = this.#visibleOptions().findIndex((option) => !option.disabled);
    this.#sync();
    this.#emit('open');
  }

  hide(): void {
    if (!this.#open) return;
    this.#open = false;
    this.#query = '';
    this.#input.value = '';
    this.#activeIndex = -1;
    this.#sync();
    this.#emit('close');
  }

  clear(): void {
    if (!this.#selected.size) return;
    this.#selected.clear();
    this.#commit();
  }

  select(value: string): void {
    this.#select(value, true);
  }

  deselect(value: string): void {
    if (!this.#selected.has(value)) return;
    this.#selected.delete(value);
    this.#commit();
  }

  getValue(): MsValue {
    return this.value;
  }

  getSelectedOptions(): MsOption[] {
    return [...this.#selected]
      .map((value) => findOption(this.#options, value) ?? { value, label: value })
      .map((option) => ({ ...option }));
  }

  #build(shadow: ShadowRoot): void {
    this.#root = document.createElement('div');
    this.#root.className = 'ms';
    this.#root.setAttribute('part', 'root');

    this.#labelEl = document.createElement('div');
    this.#labelEl.className = 'ms__label';
    this.#labelEl.setAttribute('part', 'label');

    this.#control = document.createElement('div');
    this.#control.className = 'ms__control';
    this.#control.setAttribute('part', 'control');

    this.#chips = document.createElement('div');
    this.#chips.className = 'ms__chips';
    this.#chips.setAttribute('part', 'chips');

    this.#input = document.createElement('input');
    this.#input.className = 'ms__input';
    this.#input.setAttribute('part', 'input');
    this.#input.type = 'text';
    this.#input.autocomplete = 'off';
    this.#input.spellcheck = false;
    this.#input.setAttribute('role', 'combobox');
    this.#input.setAttribute('aria-autocomplete', 'list');
    this.#input.setAttribute('aria-haspopup', 'listbox');
    this.#input.setAttribute('aria-expanded', 'false');

    this.#clearBtn = document.createElement('button');
    this.#clearBtn.type = 'button';
    this.#clearBtn.className = 'ms__icon-btn';
    this.#clearBtn.setAttribute('part', 'clear');
    this.#clearBtn.setAttribute('aria-label', 'Clear selection');
    this.#clearBtn.innerHTML = ICONS.x;

    this.#toggleBtn = document.createElement('button');
    this.#toggleBtn.type = 'button';
    this.#toggleBtn.className = 'ms__icon-btn';
    this.#toggleBtn.setAttribute('part', 'toggle');
    this.#toggleBtn.setAttribute('tabindex', '-1');
    this.#toggleBtn.setAttribute('aria-label', 'Toggle options');
    this.#toggleBtn.innerHTML = `<span class="ms__chevron" part="chevron">${ICONS.chevron}</span>`;

    const actions = document.createElement('div');
    actions.className = 'ms__actions';
    actions.append(this.#clearBtn, this.#toggleBtn);

    this.#control.append(this.#chips, this.#input, actions);

    this.#listbox = document.createElement('div');
    this.#listbox.className = 'ms__listbox';
    this.#listbox.setAttribute('part', 'listbox');
    this.#listbox.setAttribute('role', 'listbox');
    this.#listbox.id = uid('ms-listbox');

    this.#toolbar = document.createElement('div');
    this.#toolbar.className = 'ms__toolbar';
    this.#toolbar.setAttribute('part', 'toolbar');
    this.#toolbar.innerHTML = `
      <button type="button" data-action="select-all" part="select-all">Select all</button>
      <button type="button" data-action="clear-all" part="clear-all">Clear all</button>
    `;

    this.#optionsEl = document.createElement('div');
    this.#optionsEl.setAttribute('part', 'options');

    this.#listbox.append(this.#toolbar, this.#optionsEl);

    this.#live = document.createElement('div');
    this.#live.className = 'ms__live';
    this.#live.setAttribute('aria-live', 'polite');
    this.#live.setAttribute('aria-atomic', 'true');

    this.#input.setAttribute('aria-controls', this.#listbox.id);

    this.#root.append(this.#labelEl, this.#control, this.#listbox, this.#live);
    shadow.append(this.#root);
  }

  #onDocPointer = (event: Event): void => {
    const path = event.composedPath();
    if (!path.includes(this)) this.hide();
  };

  #bind(): void {
    this.#control.addEventListener('mousedown', this.#onControlMouseDown);
    this.#input.addEventListener('focus', this.#onFocus);
    this.#input.addEventListener('blur', this.#onBlur);
    this.#input.addEventListener('input', this.#onInput);
    this.#input.addEventListener('keydown', this.#onKeyDown);
    this.#clearBtn.addEventListener('click', this.#onClear);
    this.#toggleBtn.addEventListener('click', this.#onToggle);
    this.#listbox.addEventListener('mousedown', this.#onListMouseDown);
    this.#listbox.addEventListener('click', this.#onListClick);
    this.#listbox.addEventListener('mousemove', this.#onListMove);
    document.addEventListener('mousedown', this.#onDocPointer);
  }

  #unbind(): void {
    this.#control.removeEventListener('mousedown', this.#onControlMouseDown);
    this.#input.removeEventListener('focus', this.#onFocus);
    this.#input.removeEventListener('blur', this.#onBlur);
    this.#input.removeEventListener('input', this.#onInput);
    this.#input.removeEventListener('keydown', this.#onKeyDown);
    this.#clearBtn.removeEventListener('click', this.#onClear);
    this.#toggleBtn.removeEventListener('click', this.#onToggle);
    this.#listbox.removeEventListener('mousedown', this.#onListMouseDown);
    this.#listbox.removeEventListener('click', this.#onListClick);
    this.#listbox.removeEventListener('mousemove', this.#onListMove);
    document.removeEventListener('mousedown', this.#onDocPointer);
  }

  #onControlMouseDown = (event: MouseEvent): void => {
    if (this.disabled) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-remove]') || target.closest('[part="clear"]') || target === this.#input) {
      return;
    }
    event.preventDefault();
    this.#input.focus();
    this.show();
  };

  #onFocus = (): void => {
    this.#emit('focus');
  };

  #onBlur = (): void => {
    this.#emit('blur');
  };

  #onInput = (): void => {
    this.#query = this.#input.value;
    this.#emit<MsSearchDetail>('search', { query: this.#query });
    if (!this.#open) this.show();
    this.#activeIndex = this.#visibleOptions().findIndex((option) => !option.disabled);
    this.#sync();
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    const visible = this.#visibleOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.#open) {
          this.show();
          break;
        }
        this.#moveActive(visible, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.#open) {
          this.show();
          break;
        }
        this.#moveActive(visible, -1);
        break;
      case 'Home':
        if (this.#open) {
          event.preventDefault();
          this.#activeIndex = visible.findIndex((option) => !option.disabled);
          this.#sync();
        }
        break;
      case 'End':
        if (this.#open) {
          event.preventDefault();
          for (let i = visible.length - 1; i >= 0; i -= 1) {
            if (!visible[i]?.disabled) {
              this.#activeIndex = i;
              break;
            }
          }
          this.#sync();
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (!this.#open) {
          this.show();
          break;
        }
        if (this.#activeIndex >= 0) this.#toggleIndex(this.#activeIndex);
        break;
      case ' ':
        if (!this.#query) {
          event.preventDefault();
          if (!this.#open) this.show();
          else if (this.#activeIndex >= 0) this.#toggleIndex(this.#activeIndex);
        }
        break;
      case 'Escape':
        if (this.#open) {
          event.preventDefault();
          this.hide();
        }
        break;
      case 'Backspace':
        if (!this.#query && this.#multiple && this.#selected.size) {
          const last = [...this.#selected].at(-1);
          if (last) this.deselect(last);
        }
        break;
      case 'a':
      case 'A':
        if ((event.metaKey || event.ctrlKey) && this.#multiple && this.#open) {
          event.preventDefault();
          this.#selectAll();
        }
        break;
      case 'Tab':
        this.hide();
        break;
      default:
        break;
    }
  };

  #onClear = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
    this.clear();
    this.#input.focus();
  };

  #onToggle = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
    if (this.#open) this.hide();
    else {
      this.#input.focus();
      this.show();
    }
  };

  #onListMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
  };

  #onListClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const action = target.closest('button')?.dataset.action;
    if (action === 'select-all') {
      this.#selectAll();
      return;
    }
    if (action === 'clear-all') {
      this.clear();
      return;
    }
    const optionEl = target.closest<HTMLElement>('[data-value]');
    if (!optionEl) return;
    this.#select(optionEl.dataset.value ?? '', true);
  };

  #onListMove = (event: MouseEvent): void => {
    const optionEl = (event.target as HTMLElement).closest<HTMLElement>('[data-value]');
    if (!optionEl) return;
    const visible = this.#visibleOptions();
    const index = visible.findIndex((option) => option.value === optionEl.dataset.value);
    if (index >= 0 && index !== this.#activeIndex) {
      this.#activeIndex = index;
      this.#syncActive();
    }
  };

  #onChipRemove = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
    const button = event.currentTarget as HTMLElement;
    const value = button.getAttribute('data-remove');
    if (value) this.deselect(value);
    this.#input.focus();
  };

  #readAttributes(): void {
    this.#placeholder = this.getAttribute('placeholder') ?? 'Select…';
    this.#multiple = parseBoolean(this.getAttribute('multiple'), true);
    this.#searchable = parseBoolean(this.getAttribute('searchable'), true);
    this.#clearable = parseBoolean(this.getAttribute('clearable'), true);
    this.#filter = parseBoolean(this.getAttribute('filter'), true);
    const max = this.getAttribute('max-selected');
    this.#maxSelected = max == null || max === '' ? null : Number(max);
  }

  #visibleOptions(): MsOption[] {
    const selected = this.#selected;
    if (!this.#filter) return this.#options;
    return filterOptions(this.#options, this.#query, selected, false);
  }

  #select(value: string, toggle: boolean): void {
    const option = findOption(this.#options, value);
    if (!option || option.disabled) return;

    if (!this.#multiple) {
      this.#selected = new Set([value]);
      this.#commit();
      this.hide();
      return;
    }

    if (this.#selected.has(value)) {
      if (toggle) {
        this.#selected.delete(value);
        this.#commit();
      }
      return;
    }

    if (this.#atMax()) {
      this.#announce(`Maximum of ${this.#maxSelected} selections reached`);
      return;
    }

    this.#selected.add(value);
    this.#commit();
  }

  #toggleIndex(index: number): void {
    const option = this.#visibleOptions()[index];
    if (option) this.#select(option.value, true);
  }

  #selectAll(): void {
    if (!this.#multiple) return;
    const enabled = this.#visibleOptions().filter((option) => !option.disabled);
    for (const option of enabled) {
      if (this.#atMax()) break;
      this.#selected.add(option.value);
    }
    this.#commit();
  }

  #atMax(): boolean {
    return this.#maxSelected != null && this.#selected.size >= this.#maxSelected;
  }

  #enforceMax(): void {
    if (this.#maxSelected == null) return;
    const values = [...this.#selected];
    if (values.length > this.#maxSelected) {
      this.#selected = new Set(values.slice(0, this.#maxSelected));
    }
  }

  #pruneSelection(): void {
    const known = new Set(this.#options.map((option) => option.value));
    for (const value of [...this.#selected]) {
      if (!known.has(value)) this.#selected.delete(value);
    }
    this.#enforceMax();
  }

  #moveActive(visible: MsOption[], direction: 1 | -1): void {
    if (!visible.length) return;
    this.#activeIndex = nextEnabledIndex(visible, this.#activeIndex, direction);
    this.#sync();
    this.#scrollActive();
  }

  #commit(): void {
    this.#syncForm();
    this.#reflectValueAttr();
    this.#sync();
    const selectedOptions = this.getSelectedOptions();
    this.#emit<MsChangeDetail>('change', {
      value: this.value,
      selectedOptions,
    });
    this.#announce(
      this.#multiple
        ? `${this.#selected.size} selected`
        : selectedOptions[0]
          ? `${selectedOptions[0].label} selected`
          : 'Selection cleared',
    );
  }

  #syncForm(): void {
    if (!this.#internals) return;
    const name = this.name;
    if (!name) {
      this.#internals.setFormValue(null);
      return;
    }
    const values = [...this.#selected];
    if (typeof FormData !== 'undefined') {
      const data = new FormData();
      for (const value of values) data.append(name, value);
      this.#internals.setFormValue(data);
    } else {
      this.#internals.setFormValue(values.join(','));
    }
  }

  #reflectValueAttr(): void {
    const serialized = [...this.#selected].join(',');
    if (serialized) this.setAttribute('value', serialized);
    else this.removeAttribute('value');
  }

  #emit<T>(name: string, detail?: T): void {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  #announce(message: string): void {
    window.clearTimeout(this.#announceTimer);
    this.#live.textContent = '';
    this.#announceTimer = window.setTimeout(() => {
      this.#live.textContent = message;
    }, 20);
  }

  #sync(): void {
    if (!this.#connected) return;

    const labelledBy = this.getAttribute('aria-labelledby');
    const label = this.label;
    this.#labelEl.textContent = label;
    if (label) this.#labelEl.id = `${this.id}-label`;

    this.#input.disabled = this.disabled;
    this.#input.readOnly = !this.#searchable;
    this.#input.placeholder = this.#selected.size ? '' : this.#placeholder;
    this.#input.setAttribute('aria-expanded', String(this.#open));
    this.#input.setAttribute('aria-disabled', String(this.disabled));
    this.#input.setAttribute('aria-busy', String(this.loading));
    this.#input.setAttribute('aria-multiselectable', String(this.#multiple));
    if (label) this.#input.setAttribute('aria-label', label);
    else if (labelledBy) this.#input.setAttribute('aria-labelledby', labelledBy);
    else this.#input.setAttribute('aria-label', this.#placeholder);

    this.#control.classList.toggle('is-open', this.#open);
    this.#listbox.classList.toggle('is-open', this.#open);
    this.#listbox.hidden = !this.#open;
    this.#listbox.setAttribute('aria-multiselectable', String(this.#multiple));

    this.#clearBtn.hidden = !(this.#clearable && this.#selected.size && !this.disabled);
    this.#toolbar.hidden = !this.#multiple;

    const selectAllBtn = this.#toolbar.querySelector<HTMLButtonElement>('[data-action="select-all"]');
    const clearAllBtn = this.#toolbar.querySelector<HTMLButtonElement>('[data-action="clear-all"]');
    if (selectAllBtn) selectAllBtn.disabled = this.#atMax() || this.loading;
    if (clearAllBtn) clearAllBtn.disabled = this.#selected.size === 0;

    this.#renderChips();
    this.#renderOptions();
  }

  #renderChips(): void {
    this.#chips.replaceChildren();
    if (!this.#multiple) {
      const selected = this.getSelectedOptions()[0];
      if (selected && !this.#query) {
        this.#input.placeholder = selected.label;
      }
      return;
    }

    for (const option of this.getSelectedOptions()) {
      const chip = document.createElement('span');
      chip.className = 'ms__chip';
      chip.setAttribute('part', 'chip');

      const text = document.createElement('span');
      text.className = 'ms__chip-label';
      text.textContent = option.label;
      chip.append(text);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'ms__chip-remove';
      remove.setAttribute('part', 'chip-remove');
      remove.setAttribute('data-remove', option.value);
      remove.setAttribute('aria-label', `Remove ${option.label}`);
      remove.innerHTML = ICONS.x;
      remove.addEventListener('click', this.#onChipRemove);
      chip.append(remove);
      this.#chips.append(chip);
    }
  }

  #renderOptions(): void {
    const visible = this.#visibleOptions();
    this.#optionsEl.replaceChildren();

    if (this.loading) {
      const status = document.createElement('div');
      status.className = 'ms__status';
      status.setAttribute('part', 'loading');
      status.innerHTML = `<span class="ms__spinner"></span>Loading…`;
      this.#optionsEl.append(status);
      this.#input.removeAttribute('aria-activedescendant');
      return;
    }

    if (!visible.length) {
      const status = document.createElement('div');
      status.className = 'ms__status';
      status.setAttribute('part', 'empty');
      const slot = this.querySelector('[slot="empty"]');
      status.textContent = slot?.textContent?.trim() || 'No results found';
      this.#optionsEl.append(status);
      this.#input.removeAttribute('aria-activedescendant');
      return;
    }

    this.#activeIndex = clamp(this.#activeIndex, -1, visible.length - 1);
    const groups = groupOptions(visible);

    for (const group of groups) {
      if (group.name) {
        const heading = document.createElement('div');
        heading.className = 'ms__group-label';
        heading.setAttribute('part', 'group-label');
        heading.textContent = group.name;
        this.#optionsEl.append(heading);
      }

      for (const option of group.options) {
        const index = visible.indexOf(option);
        const selected = this.#selected.has(option.value);
        const active = index === this.#activeIndex;
        const optionId = `${this.#listbox.id}-opt-${index}`;

        const el = document.createElement('div');
        el.className = 'ms__option';
        el.id = optionId;
        el.setAttribute('part', 'option');
        el.setAttribute('role', 'option');
        el.setAttribute('data-value', option.value);
        el.setAttribute('aria-selected', String(selected));
        el.setAttribute('aria-disabled', String(Boolean(option.disabled)));
        el.classList.toggle('is-selected', selected);
        el.classList.toggle('is-active', active);
        el.classList.toggle('is-disabled', Boolean(option.disabled));

        if (this.#renderOption) {
          const node = this.#renderOption(option, {
            selected,
            active,
            disabled: Boolean(option.disabled),
          });
          if (typeof node === 'string') el.innerHTML = node;
          else el.append(node);
        } else {
          const check = document.createElement('span');
          check.className = 'ms__check';
          check.setAttribute('part', 'check');
          if (selected) check.innerHTML = ICONS.check;

          const copy = document.createElement('span');
          copy.className = 'ms__option-copy';
          const label = document.createElement('span');
          label.setAttribute('part', 'option-label');
          label.textContent = option.label;
          copy.append(label);
          if (option.description) {
            const desc = document.createElement('span');
            desc.className = 'ms__option-desc';
            desc.setAttribute('part', 'option-description');
            desc.textContent = option.description;
            copy.append(desc);
          }
          el.append(check, copy);
        }

        this.#optionsEl.append(el);
        if (active) this.#input.setAttribute('aria-activedescendant', optionId);
      }
    }
  }

  #syncActive(): void {
    const options = this.#optionsEl.querySelectorAll<HTMLElement>('[data-value]');
    const visible = this.#visibleOptions();
    options.forEach((el, index) => {
      const active = index === this.#activeIndex;
      el.classList.toggle('is-active', active);
      if (active) this.#input.setAttribute('aria-activedescendant', el.id);
    });
    if (this.#activeIndex < 0 || !visible.length) this.#input.removeAttribute('aria-activedescendant');
    this.#scrollActive();
  }

  #scrollActive(): void {
    const active = this.#optionsEl.querySelector('.is-active');
    active?.scrollIntoView({ block: 'nearest' });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ms-multiselect': MsMultiselect;
  }
}
