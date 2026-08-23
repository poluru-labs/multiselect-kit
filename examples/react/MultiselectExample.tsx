import { useEffect, useRef, useState } from 'react';
import '@poluru-labs/multiselect-kit';
import type { MsChangeDetail, MsMultiselect, MsOption } from '@poluru-labs/multiselect-kit';

const OPTIONS: MsOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'eng', label: 'Engineering' },
  { value: 'ops', label: 'Operations' },
];

export function MultiselectExample() {
  const ref = useRef<MsMultiselect>(null);
  const [value, setValue] = useState<string[]>(['eng']);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.options = OPTIONS;
    el.value = value;
    const onChange = (event: Event) => {
      setValue((event as CustomEvent<MsChangeDetail>).detail.value as string[]);
    };
    el.addEventListener('change', onChange);
    return () => el.removeEventListener('change', onChange);
  }, [value]);

  return (
    <ms-multiselect
      ref={ref}
      label="Departments"
      placeholder="Select departments"
    />
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ms-multiselect': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { label?: string; placeholder?: string };
    }
  }
}
