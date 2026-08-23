import type { Meta, StoryObj } from '@storybook/web-components';
import './index.js';
import type { MsMultiselect } from './ms-multiselect.js';
import type { MsOption } from './types.js';

const OPTIONS: MsOption[] = [
  { value: 'alpha', label: 'Alpha', group: 'Greek', description: 'First letter' },
  { value: 'beta', label: 'Beta', group: 'Greek' },
  { value: 'gamma', label: 'Gamma', group: 'Greek', disabled: true },
  { value: 'one', label: 'One', group: 'Numbers' },
  { value: 'two', label: 'Two', group: 'Numbers' },
  { value: 'three', label: 'Three', group: 'Numbers' },
];

function demo(setup: (el: MsMultiselect, wrap: HTMLDivElement) => void): HTMLElement {
  const wrap = document.createElement('div');
  wrap.style.width = '360px';
  const el = document.createElement('ms-multiselect') as MsMultiselect;
  el.options = OPTIONS;
  setup(el, wrap);
  wrap.append(el);
  return wrap;
}

const meta: Meta = {
  title: 'MsMultiselect',
  component: 'ms-multiselect',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {
  render: () =>
    demo((el) => {
      el.label = 'Team members';
      el.placeholder = 'Search people';
    }),
};

export const Grouped: Story = {
  render: () =>
    demo((el) => {
      el.label = 'Grouped';
      el.placeholder = 'Select';
      queueMicrotask(() => el.show());
    }),
};

export const SingleSelect: Story = {
  render: () =>
    demo((el) => {
      el.label = 'Assignee';
      el.placeholder = 'Pick one';
      el.multiple = false;
    }),
};

export const MaxSelected: Story = {
  render: () =>
    demo((el) => {
      el.label = 'Pick up to 2';
      el.maxSelected = 2;
    }),
};

export const Loading: Story = {
  render: () =>
    demo((el) => {
      el.label = 'Remote results';
      el.loading = true;
      el.options = [];
      queueMicrotask(() => el.show());
    }),
};

export const Disabled: Story = {
  render: () =>
    demo((el) => {
      el.label = 'Read only';
      el.disabled = true;
      el.value = ['alpha', 'one'];
    }),
};

export const Themed: Story = {
  render: () =>
    demo((el, wrap) => {
      wrap.style.setProperty('--ms-accent', '#0f766e');
      wrap.style.setProperty('--ms-accent-soft', '#ccfbf1');
      wrap.style.setProperty('--ms-chip-bg', '#ccfbf1');
      wrap.style.setProperty('--ms-radius', '6px');
      el.label = 'Themed';
      el.placeholder = 'Custom CSS properties';
      el.value = ['beta'];
    }),
};
