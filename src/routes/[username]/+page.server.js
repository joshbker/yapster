import { error } from "@sveltejs/kit"

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params, locals, fetch }) => {
    const { username } = params

    const user = await fetch(`/api/user/username/${username}`)

    if (!user.ok) {
        throw error(404, "User not found")
    }

    const userData = await user.json()

    return {
        user: locals.user,
        displayedUser: userData
    }
}

export const csr = false; // Disable client-side rendering for this route