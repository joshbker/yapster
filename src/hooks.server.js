import { auth } from "$lib/auth/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { error, redirect } from "@sveltejs/kit";

const unauthenticatedRoutes = ["/account/create", "/account/login", "/account/forgot-password"];

export async function handle({ event, resolve }) {
    const session = await auth.api.getSession({ headers: event.request.headers });

    if (session) {
        event.locals.user = session.user;
    }

    console.log("PATHNAME", event.url.pathname)

    // Protect API routes
    if (
        event.url.pathname.startsWith("/api/") &&
        !event.url.pathname.startsWith("/api/auth") &&
        !session
    ) {
        throw error(401, "Unauthorized");
    }

    if (unauthenticatedRoutes.includes(event.url.pathname) && session) {
        throw redirect(302, "/");
    }

    if (!session) {
        throw redirect(302, "/account/login");
    }

    return svelteKitHandler({ event, resolve, auth });
}