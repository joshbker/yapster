import { error } from "@sveltejs/kit"

export const load = async ({ params, locals, fetch }) => {
    console.log("PARAMS", params)
    const { username } = params

    const user = await fetch(`/api/user/username/${username}`)

    if (!user.ok) {
        throw error(404, "User not found")
    }

    return {
        locals: locals,
        displayedUser: await user.json()
    }
}