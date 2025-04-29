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
				defaultValue: ""
			},
			pronouns: {
				type: "string",
				required: true,
				defaultValue: ""
			},
			bio: {
				type: "string",
				required: true,
				defaultValue: ""
			},
			verified: {
				type: "boolean",
				required: true,
				defaultValue: false
			}
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
