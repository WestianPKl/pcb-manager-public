import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./src/__tests__/setup.ts'],
		include: ['src/**/*.test.ts', 'src/**/*.test.js'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/modules/**/*.ts', 'src/utils/**/*.ts'],
			exclude: ['src/__tests__/**'],
		},
	},
})
