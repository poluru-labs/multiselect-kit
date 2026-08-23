import type { Preview } from '@storybook/web-components';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    options: {
      storySort: { order: ['MsMultiselect', ['Playground', '*']] },
    },
  },
};

export default preview;
