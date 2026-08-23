/** Option value. Keep this a string so attributes, forms, and events stay simple. */
export type MsOptionValue = string;

export interface MsOption {
  value: MsOptionValue;
  label: string;
  disabled?: boolean;
  group?: string;
  description?: string;
}

export type MsValue = string | string[] | null;

export interface MsChangeDetail {
  value: MsValue;
  selectedOptions: MsOption[];
}

export interface MsSearchDetail {
  query: string;
}

export interface MsRenderOptionState {
  selected: boolean;
  active: boolean;
  disabled: boolean;
}

/**
 * Optional hook to customize option inner HTML.
 * Return a string of HTML (sanitized by you) or an Element.
 */
export type MsRenderOption = (
  option: MsOption,
  state: MsRenderOptionState,
) => string | Node;

export const TAG_NAME = 'ms-multiselect';
