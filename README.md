# multiselect-kit

Accessible, lightweight, and customizable multi-select component kit for modern web apps.

`@poluru-labs/multiselect-kit` is a framework-agnostic **Web Component**. Use it in plain HTML, Bootstrap, Tailwind, React, Vue, Angular, Svelte, Next.js, Nuxt, Astro, and any other DOM environment.

- Zero React/Vue/Angular runtime dependency
- TypeScript + ESM
- Shadow DOM, CSS parts, and CSS custom properties
- WAI-ARIA combobox / listbox keyboard behavior
- Form-associated (`ElementInternals`) when the browser supports it

## Installation

```bash
npm install @poluru-labs/multiselect-kit
```

## Quick start

```html
<script type="module">
  import '@poluru-labs/multiselect-kit';

  const el = document.querySelector('ms-multiselect');
  el.options = [
    { value: 'design', label: 'Design' },
    { value: 'eng', label: 'Engineering', description: 'Product engineering' },
    { value: 'ops', label: 'Operations', disabled: true },
  ];
  el.addEventListener('change', (event) => {
    console.log(event.detail.value);
  });
</script>

<ms-multiselect
  label="Teams"
  placeholder="Select teams"
  name="teams"
></ms-multiselect>
```

Local playground:

```bash
npm install
npm run dev          # http://localhost:5173
npm run storybook    # http://localhost:6011
```

## Option model

```ts
type MsOption = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  description?: string;
};
```

## API

### Attributes / properties

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `MsOption[]` | `[]` | Option list (property only) |
| `value` | `string \| string[] \| null` | `[]` / `null` | Selected value(s). Array when `multiple` |
| `placeholder` | `string` | `"Select…"` | Shown when nothing is selected |
| `label` | `string` | `""` | Visible label + accessible name |
| `name` | `string` | `""` | Native form field name |
| `disabled` | `boolean` | `false` | Disables the control |
| `loading` | `boolean` | `false` | Async loading state in the listbox |
| `multiple` | `boolean` | `true` | Set `multiple="false"` for single-select |
| `maxSelected` / `max-selected` | `number \| null` | `null` | Cap the number of selections |
| `searchable` | `boolean` | `true` | Local typeahead input |
| `clearable` | `boolean` | `true` | Show the clear button |
| `filter` | `boolean` | `true` | Local filter. Set `false` for remote search |
| `renderOption` | function | — | Custom option rendering hook |
| `open` | `boolean` | `false` | Open/close the listbox |

Controlled usage: listen for `change` and write `el.value` back. Uncontrolled usage: set an initial `value` and let the component keep state.

### Methods

| Method | Description |
| --- | --- |
| `focus()` | Focus the combobox input |
| `blur()` | Blur the input |
| `show()` / `hide()` | Open or close the listbox |
| `clear()` | Clear the selection |
| `select(value)` | Select an option value |
| `deselect(value)` | Remove an option value |
| `getValue()` | Current `value` |
| `getSelectedOptions()` | Selected `MsOption[]` |

### Events

All events bubble and are composed (cross Shadow DOM).

| Event | `detail` | When |
| --- | --- | --- |
| `change` | `{ value, selectedOptions }` | Selection changed |
| `search` | `{ query }` | Input query changed |
| `open` | — | Listbox opened |
| `close` | — | Listbox closed |
| `focus` | — | Combobox focused |
| `blur` | — | Combobox blurred |

Remote search: set `filter="false"`, listen to `search`, then assign a new `options` array (and `loading`).

## Styling

The control uses Shadow DOM. Theme it from the outside with CSS custom properties and `::part()`.

```css
ms-multiselect {
  --ms-accent: #2563eb;
  --ms-radius: 10px;
  --ms-control-bg: #fff;
  --ms-chip-bg: #f2f4f7;
}

ms-multiselect::part(control) { min-height: 44px; }
ms-multiselect::part(chip) { font-weight: 600; }
ms-multiselect::part(option):hover { background: #f5f7fa; }
```

### CSS custom properties

`--ms-font-family`, `--ms-font-size`, `--ms-radius`, `--ms-chip-radius`, `--ms-control-min-height`, `--ms-control-padding`, `--ms-control-bg`, `--ms-control-border`, `--ms-control-shadow`, `--ms-text`, `--ms-muted`, `--ms-accent`, `--ms-accent-soft`, `--ms-chip-bg`, `--ms-chip-text`, `--ms-option-hover`, `--ms-option-active`, `--ms-list-bg`, `--ms-list-border`, `--ms-list-shadow`, `--ms-focus-ring`, `--ms-z-index`, `--ms-disabled-opacity`

### Parts

`root`, `label`, `control`, `chips`, `chip`, `chip-remove`, `input`, `clear`, `toggle`, `chevron`, `listbox`, `toolbar`, `select-all`, `clear-all`, `options`, `group-label`, `option`, `option-label`, `option-description`, `check`, `empty`, `loading`

### Slots

Place an `[slot="empty"]` child to customize the empty-state copy:

```html
<ms-multiselect>
  <span slot="empty">Nothing matched that search</span>
</ms-multiselect>
```

### Custom option rendering

```js
el.renderOption = (option, { selected }) => {
  const node = document.createElement('span');
  node.textContent = `${selected ? '✓ ' : ''}${option.label}`;
  return node;
};
```

## Framework usage

Custom elements are properties-based for objects (`options`, `value`). Set those from a ref / `onMounted` / `ngAfterViewInit`. See `examples/` for full files.

### React

```tsx
import { useEffect, useRef } from 'react';
import '@poluru-labs/multiselect-kit';
import type { MsMultiselect } from '@poluru-labs/multiselect-kit';

export function Example() {
  const ref = useRef<MsMultiselect>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.options = [{ value: 'eng', label: 'Engineering' }];
  }, []);
  return <ms-multiselect ref={ref} label="Team" />;
}
```

For Next.js, import the package in a Client Component (`'use client'`). The registrar is SSR-safe (`customElements` is feature-detected).

### Vue

```vue
<script setup>
import { onMounted, ref } from 'vue';
import '@poluru-labs/multiselect-kit';
const host = ref();
onMounted(() => { host.value.options = [{ value: 'eng', label: 'Engineering' }]; });
</script>
<template>
  <ms-multiselect ref="host" label="Team" />
</template>
```

Nuxt: register the import in a client-only plugin.

### Angular

Add `CUSTOM_ELEMENTS_SCHEMA` and import `@poluru-labs/multiselect-kit` once (for example in `main.ts`). Assign `options` on the element after view init.

### Svelte

```svelte
<script>
  import { onMount } from 'svelte';
  import '@poluru-labs/multiselect-kit';
  let host;
  onMount(() => { host.options = [{ value: 'eng', label: 'Engineering' }]; });
</script>
<ms-multiselect bind:this={host} label="Team"></ms-multiselect>
```

### Bootstrap 5

Load Bootstrap CSS, then map the control to Bootstrap form tokens. Full form (multiple, max selected, single-select, native comparison) is in `examples/bootstrap/index.html`.

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
/>

<style>
  ms-multiselect.form-ms {
    --ms-font-family: var(--bs-body-font-family);
    --ms-radius: var(--bs-border-radius);
    --ms-accent: var(--bs-primary);
    --ms-control-bg: var(--bs-body-bg);
    --ms-control-border: var(--bs-border-width) solid var(--bs-border-color);
    --ms-focus-ring: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25);
  }
</style>

<form class="mb-3">
  <ms-multiselect
    class="form-ms"
    label="Teams"
    placeholder="Select teams"
    name="teams"
  ></ms-multiselect>
</form>
```

### Tailwind CSS

Load Tailwind, then map the control to Tailwind-like tokens (`rounded-md`, `blue-600`, `gray-300`). Full form (multiple, max selected, single-select, native comparison) is in `examples/tailwind/index.html`.

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

<style>
  ms-multiselect.tw-ms {
    --ms-font-family: ui-sans-serif, system-ui, sans-serif;
    --ms-radius: 0.375rem;
    --ms-accent: #2563eb;
    --ms-control-bg: #fff;
    --ms-control-border: 1px solid #d1d5db;
    --ms-focus-ring: 0 0 0 3px rgb(37 99 235 / 0.2);
  }
</style>

<form class="max-w-md">
  <ms-multiselect
    class="tw-ms"
    label="Teams"
    placeholder="Select teams"
    name="teams"
  ></ms-multiselect>
</form>
```

### Optional helper

```ts
import { bindMultiselect } from '@poluru-labs/multiselect-kit';

const stop = bindMultiselect(el, {
  options,
  value,
  onChange: (detail) => setValue(detail.value),
});
```

## Accessibility

- Combobox input with `aria-expanded`, `aria-controls`, `aria-activedescendant`
- Listbox + `option` with `aria-selected` / `aria-disabled`
- `aria-multiselectable` in multiple mode
- Keyboard: `↑` `↓` `Home` `End` `Enter` `Space` `Escape` `Tab` `Backspace` `Ctrl/Cmd+A`
- Selected chips include an accessible remove button (`aria-label="Remove {label}"`)
- Polite live region announces selection changes
- `delegatesFocus` so a host `label[for]` / programmatic `focus()` reaches the input

## Architecture notes

- Core is a single custom element (`MsMultiselect`) — no Lit/React/Vue
- `defineMultiselect()` is exported for custom tag names and SSR
- Local filtering is isolated so you can later swap in remote search or virtualization
- Tree-shaking: import `{ MsMultiselect, defineMultiselect }` if you need a custom tag name; `import '@poluru-labs/multiselect-kit'` auto-registers `<ms-multiselect>`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite playground |
| `npm run storybook` | Storybook on 6011 |
| `npm test` | Vitest |
| `npm run typecheck` | TypeScript |
| `npm run build` | ESM + `.d.ts` into `dist/` |

## License

MIT © 2026 Subrahmanyam Poluru / Poluru Labs
