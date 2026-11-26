// Proxies PostHog through /a/ on this domain, so ad blockers that list
// PostHog's hosts and paths don't drop the analytics. wrangler.jsonc runs
// this Worker only for /a/*; every other path is served from the static assets.
const PREFIX = '/a'
const API_HOST = 'eu.i.posthog.com'
const ASSET_HOST = 'eu-assets.i.posthog.com'

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url)
		if (!url.pathname.startsWith(`${PREFIX}/`)) return env.ASSETS.fetch(request)

		const path = decodePath(url.pathname.slice(PREFIX.length + 1)) + url.search
		return path.startsWith('/static/')
			? staticAsset(request, `https://${ASSET_HOST}${path}`, ctx)
			: forward(request, `https://${API_HOST}${path}`)
	},
}

/**
 * posthog.astro sends each path base64url-encoded as one segment, because
 * filter lists match PostHog's own paths on any domain. Plain paths still
 * work, e.g. the snippet's /a/static/array.js.
 */
function decodePath(rest) {
	if (!rest.includes('/')) {
		try {
			const path = atob(rest.replace(/-/g, '+').replace(/_/g, '/'))
			if (path.startsWith('/')) return path
		} catch {}
	}
	return `/${rest}`
}

/** The SDK bundle is versioned and public, so it's cached at the edge. */
async function staticAsset(request, target, ctx) {
	if (request.method !== 'GET') return fetch(target, { method: request.method })

	const cached = await caches.default.match(request)
	if (cached) return cached

	const response = await fetch(target)
	if (response.ok) ctx.waitUntil(caches.default.put(request, response.clone()))
	return response
}

/** Passes the visitor's IP on so PostHog's GeoIP still sees the real location. */
function forward(request, target) {
	const headers = new Headers(request.headers)
	headers.delete('cookie')
	headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') ?? '')

	return fetch(target, {
		method: request.method,
		headers,
		body: request.body,
		redirect: 'manual',
	})
}
