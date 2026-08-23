import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dts from 'vite-plugin-dts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const isStorybook = process.argv.some(
  (arg) => arg.includes('storybook') || arg.includes('storybook/'),
);

export default defineConfig({
  build: isStorybook
    ? {}
    : {
        lib: {
          entry: resolve(rootDir, 'src/index.ts'),
          formats: ['es'],
          fileName: 'index',
        },
        sourcemap: true,
        target: 'es2022',
        minify: false,
      },
  plugins: isStorybook
    ? []
    : [
        dts({
          tsconfigPath: resolve(rootDir, 'tsconfig.build.json'),
          include: ['src'],
          exclude: [
            'src/**/*.stories.ts',
            'src/**/*.test.ts',
            'src/**/*.spec.ts',
            'src/playground.ts',
          ],
          rollupTypes: true,
        }),
      ],
});
