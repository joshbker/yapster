import { auth } from "$lib/auth/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { error, redirect } from "@sveltejs/kit";

const unauthenticatedRoutes = ["/account/create", "/account/login", "/account/forgot-password"];

// Configure request size limits
const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB

export async function handle({ event, resolve }) {
    // Check content length for POST requests
    if (event.request.method === 'POST') {
        const contentLength = parseInt(event.request.headers.get('content-length') || '0');
        if (contentLength > MAX_REQUEST_SIZE) {
            throw error(413, `Request entity too large. Maximum size is ${MAX_REQUEST_SIZE / (1024 * 1024)}MB`);
        }
    }

    const session = await auth.api.getSession({ headers: event.request.headers });
    const pathname = event.url.pathname;
    
    if (session) {
        event.locals.user = session.user;
    }

    const isApiRoute = pathname.startsWith("/api/");
    const isAuthRoute = pathname.startsWith("/api/auth");
    const isUnauthenticatedRoute = unauthenticatedRoutes.includes(pathname);

    // Handle API routes - require auth except for auth endpoints
    if (isApiRoute && !isAuthRoute && !session) {
        throw error(401, "Unauthorized");
    }

    // Redirect authenticated users away from login/register pages
    if (isUnauthenticatedRoute && session) {
        throw redirect(302, "/");
    }

    // Require authentication for all routes except auth routes and unauthenticated routes
    if (!isUnauthenticatedRoute && !isAuthRoute && !session) {
        throw redirect(302, "/account/login");
    }

    return svelteKitHandler({ event, resolve, auth });
}