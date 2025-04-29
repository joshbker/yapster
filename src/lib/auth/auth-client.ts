import { createAuthClient } from "better-auth/svelte";
import { usernameClient } from "better-auth/client/plugins";
import { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { PUBLIC_BASE_URL } from "$env/static/public";

export const client = createAuthClient({
	baseURL: PUBLIC_BASE_URL,
	plugins: [inferAdditionalFields<typeof auth>(), usernameClient()],
});

export const {
	signIn,
	signUp,
	deleteUser,
	useSession,
	updateUser,
	changePassword,
	changeEmail,
} = client;