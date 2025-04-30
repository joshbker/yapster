import { auth } from "$lib/auth/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { error, redirect } from "@sveltejs/kit";

const unauthenticatedRoutes = ["/account/create", "/account/login", "/account/forgot-password"];

export async function handle({ event, resolve }) {
    const session = await auth.api.getSession({ headers: event.request.headers });
    const pathname = event.url.pathname;
    
    if (session) {
        event.locals.user = session.user;
    }

    const isApiRoute = pathname.startsWith("/api/");
    const isAuthRoute = pathname.startsWith("/api/auth");
    const isUserRoute = pathname.startsWith("/api/user/username");
    const isProfileRoute = pathname.startsWith("/@");
    const isUnauthenticatedRoute = unauthenticatedRoutes.includes(pathname);

    // Handle API routes - require auth except for auth endpoints
    if (isApiRoute && !isAuthRoute && !isUserRoute && !session) {
        throw error(401, "Unauthorized");
    }

    // Redirect authenticated users away from login/register pages
    if (isUnauthenticatedRoute && session) {
        throw redirect(302, "/");
    }

    // Require authentication for all routes except auth routes and unauthenticated routes
    if (!isUnauthenticatedRoute && !isAuthRoute && !isUserRoute && !isProfileRoute && !session) {
        throw redirect(302, "/account/login");
    }

    return svelteKitHandler({ event, resolve, auth });
}