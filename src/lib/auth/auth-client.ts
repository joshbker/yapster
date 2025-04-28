import { createAuthClient } from "better-auth/svelte";
import { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { PUBLIC_BASE_URL } from "$env/static/public";

export const client = createAuthClient({
  baseURL: PUBLIC_BASE_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, useSession } = client;