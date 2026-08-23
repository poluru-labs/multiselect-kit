<script lang="ts">
  import { onMount } from 'svelte';
  import '@poluru-labs/multiselect-kit';
  import type { MsChangeDetail, MsMultiselect, MsOption } from '@poluru-labs/multiselect-kit';

  const OPTIONS: MsOption[] = [
    { value: 'design', label: 'Design' },
    { value: 'eng', label: 'Engineering' },
    { value: 'ops', label: 'Operations' },
  ];

  let host: MsMultiselect;
  let selected: string[] = ['eng'];

  onMount(() => {
    host.options = OPTIONS;
    host.value = selected;
  });

  function onChange(event: Event) {
    selected = (event as CustomEvent<MsChangeDetail>).detail.value as string[];
  }
</script>

<ms-multiselect
  bind:this={host}
  label="Departments"
  placeholder="Select departments"
  on:change={onChange}
></ms-multiselect>
