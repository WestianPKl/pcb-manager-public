/**
 * Converts a stored file path/URL to a public-accessible URL via /storage/ proxy.
 *
 * Handles all formats:
 *   - Legacy prod:  "http://minio:9000/avatars/uuid.webp"  → "/storage/avatars/uuid.webp"
 *   - Legacy dev:   "http://localhost:9000/avatars/uuid.webp" → "/storage/avatars/uuid.webp"
 *   - Current:      "avatars/uuid.webp"                    → "/storage/avatars/uuid.webp"
 *
 * In dev, Vite proxies /storage → http://localhost:9000.
 * In prod, nginx proxies /storage → http://minio:9000.
 */
export function toStorageUrl(url: string): string {
	if (url.startsWith('http://') || url.startsWith('https://')) {
		try {
			const parsed = new URL(url)
			if (parsed.hostname === 'minio' || (parsed.hostname === 'localhost' && parsed.port === '9000')) {
				return `/storage/${parsed.pathname.replace(/^\//, '')}`
			}
		} catch {
			return url
		}
		return url
	}
	return `/storage/${url}`
}
