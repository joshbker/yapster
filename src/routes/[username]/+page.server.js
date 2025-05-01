import { error } from "@sveltejs/kit"

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params, locals, fetch }) => {
    let { username } = params

    if (!username.startsWith("@")) {
        throw error(404)
    }

    username = username.slice(1)

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