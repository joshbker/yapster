import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { database } from "$lib/data/mongo";

export const auth = betterAuth({
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
			displayName: {
				type: "string",
				required: true,
			},
		},
	},
	database: mongodbAdapter(database),
	advanced: {
		cookiePrefix: "yapster",
	}
});
