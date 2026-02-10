import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/extension/**/*.vitest.ts'],
    globals: true,
  },
});
