import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { database } from "$lib/data/mongo";

export const auth = betterAuth({
	plugins: [
		username({
			minUsernameLength: 3,
			maxUsernameLength: 24
		})
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
			saves: {
				type: "string[]",
				required: true,
			},
			comments: {
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
			"/api/image": {
				window: 60,
				max: 3,
			},
		}
	},
});
