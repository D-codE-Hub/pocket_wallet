import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import proxyOptions from './proxyOptions';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
			manifest: {
				name: 'Pocket Wallet',
				short_name: 'PocketWallet',
				description: 'Track your expenses and manage your wallet on the go',
				theme_color: '#14b8a6',
				background_color: '#f9fafb',
				display: 'standalone',
				orientation: 'portrait-primary',
				scope: '/',
				start_url: '/',
				categories: ['finance', 'utilities'],
				icons: [
					{
						src: 'icons/icon-72x72.png',
						sizes: '72x72',
						type: 'image/png',
					},
					{
						src: 'icons/icon-96x96.png',
						sizes: '96x96',
						type: 'image/png',
					},
					{
						src: 'icons/icon-128x128.png',
						sizes: '128x128',
						type: 'image/png',
					},
					{
						src: 'icons/icon-144x144.png',
						sizes: '144x144',
						type: 'image/png',
					},
					{
						src: 'icons/icon-152x152.png',
						sizes: '152x152',
						type: 'image/png',
					},
					{
						src: 'icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'icons/icon-384x384.png',
						sizes: '384x384',
						type: 'image/png',
					},
					{
						src: 'icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'icons/maskable-icon-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable',
					},
					{
						src: 'icons/maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'gstatic-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /\/api\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24, // 24 hours
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
							networkTimeoutSeconds: 10,
						},
					},
				],
			},
			devOptions: {
				enabled: true,
			},
		}),
	],
	server: {
		port: 8080,
		host: '0.0.0.0',
		proxy: proxyOptions
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src')
		}
	},
	build: {
		outDir: '../pocket_wallet/public/frontend',
		emptyOutDir: true,
		target: 'es2015',
	},
});
