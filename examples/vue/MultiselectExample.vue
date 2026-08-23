<script setup lang="ts">
import { onMounted, ref } from 'vue';
import '@poluru-labs/multiselect-kit';
import type { MsChangeDetail, MsMultiselect, MsOption } from '@poluru-labs/multiselect-kit';

const OPTIONS: MsOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'eng', label: 'Engineering' },
  { value: 'ops', label: 'Operations' },
];

const host = ref<MsMultiselect | null>(null);
const selected = ref<string[]>(['eng']);

onMounted(() => {
  const el = host.value;
  if (!el) return;
  el.options = OPTIONS;
  el.value = selected.value;
  el.addEventListener('change', (event) => {
    selected.value = (event as CustomEvent<MsChangeDetail>).detail.value as string[];
  });
});
</script>

<template>
  <ms-multiselect
    ref="host"
    label="Departments"
    placeholder="Select departments"
  />
</template>
