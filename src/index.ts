import { defineMultiselect } from './register.js';

export { MsMultiselect } from './ms-multiselect.js';
export { defineMultiselect, isMultiselectDefined } from './register.js';
export { bindMultiselect, type BindMultiselectConfig } from './bind.js';
export { TAG_NAME } from './types.js';
export type {
  MsChangeDetail,
  MsOption,
  MsOptionValue,
  MsRenderOption,
  MsRenderOptionState,
  MsSearchDetail,
  MsValue,
} from './types.js';

defineMultiselect();
