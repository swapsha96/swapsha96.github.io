/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
	test: {
		exclude: ['tests/e2e/**/*', 'node_modules/**/*', 'dist/**/*', '.git/**/*', '.cache/**/*'],
		/* for example, use global to avoid globals imports (describe, test, expect): */
		// globals: true,
	},
});
