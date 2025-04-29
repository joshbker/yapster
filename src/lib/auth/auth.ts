import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { database } from "$lib/data/mongo";

export const auth = betterAuth({
	plugins: [
		username()
	],
	emailAndPassword: {
		enabled: true,
	},
	user: {
		changeEmail: {
			enabled: true,
		},
		deleteUser: {
			enabled: true,
		},
		additionalFields: {
			banner: {
				type: "string",
				required: true,
			},
			pronouns: {
				type: "string",
				required: true,
			},
			bio: {
				type: "string",
				required: true,
			},
			verified: {
				type: "boolean",
				required: true,
			},
			following: {
				type: "string[]",
				required: true,
			},
			followers: {
				type: "string[]",
				required: true,
			},
			posts: {
				type: "string[]",
				required: true,
			},
			likes: {
				type: "string[]",
				required: true,
			},
		},
	},
	database: mongodbAdapter(database),
	advanced: {
		cookiePrefix: "yapster",
	},
	rateLimit: {
		window: 30,
		max: 100,
		customRules: {
			"/api/me/avatar": {
				window: 60,
				max: 3,
			},
			"/api/me/banner": {
				window: 60,
				max: 3,
			},
		}
	},
});
