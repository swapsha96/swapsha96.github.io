/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
	test: {
		environment: 'jsdom',
		setupFiles: ['tests/unit/setup.ts'],
		exclude: ['tests/e2e/**/*', 'node_modules/**/*', 'dist/**/*', '.git/**/*', '.cache/**/*'],
	},
});
