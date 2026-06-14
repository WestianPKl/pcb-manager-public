import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		tailwindcss(),
		reactRouter(),
		{
			name: 'ignore-chrome-devtools-request',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					if (req.url === '/.well-known/appspecific/com.chrome.devtools.json') {
						res.writeHead(404).end()
						return
					}
					next()
				})
			},
		},
	],
	server: {
		proxy: {
			'/storage': {
				target: 'http://localhost:9000',
				rewrite: path => path.replace(/^\/storage/, ''),
			},
		},
	},
	resolve: {
		tsconfigPaths: true,
	},
})
