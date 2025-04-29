import adapter from '@sveltejs/adapter-node';

/** @type {import("@sveltejs/kit").Config} */
const config = {
	kit: {
		adapter: adapter({
			maxRequestBodySize: 10 * 1024 * 1024 // 10MB max request size
		}),
	},
}

export default config