import { MsMultiselect } from './ms-multiselect.js';
import { TAG_NAME } from './types.js';

export function defineMultiselect(tagName: string = TAG_NAME): typeof MsMultiselect {
  if (typeof customElements === 'undefined') return MsMultiselect;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, MsMultiselect);
  }
  return MsMultiselect;
}

export function isMultiselectDefined(tagName: string = TAG_NAME): boolean {
  return typeof customElements !== 'undefined' && Boolean(customElements.get(tagName));
}
