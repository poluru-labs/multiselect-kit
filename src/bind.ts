import type { MsChangeDetail, MsOption, MsValue } from './types.js';
import type { MsMultiselect } from './ms-multiselect.js';

export interface BindMultiselectConfig {
  options?: MsOption[];
  value?: MsValue;
  onChange?: (detail: MsChangeDetail) => void;
  onSearch?: (query: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Framework-agnostic helper to assign object properties and subscribe to events.
 * Useful from React/Vue/Svelte when you have an element reference.
 */
export function bindMultiselect(
  element: MsMultiselect,
  config: BindMultiselectConfig,
): () => void {
  if (config.options) element.options = config.options;
  if (config.value !== undefined) element.value = config.value;

  const onChange = (event: Event) => {
    config.onChange?.((event as CustomEvent<MsChangeDetail>).detail);
  };
  const onSearch = (event: Event) => {
    config.onSearch?.((event as CustomEvent<{ query: string }>).detail.query);
  };
  const onOpen = () => config.onOpen?.();
  const onClose = () => config.onClose?.();

  element.addEventListener('change', onChange);
  element.addEventListener('search', onSearch);
  element.addEventListener('open', onOpen);
  element.addEventListener('close', onClose);

  return () => {
    element.removeEventListener('change', onChange);
    element.removeEventListener('search', onSearch);
    element.removeEventListener('open', onOpen);
    element.removeEventListener('close', onClose);
  };
}
