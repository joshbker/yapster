import { json, error } from "@sveltejs/kit"

export const GET = async ({ locals }) => {
    const user = locals.user

    if (!user) {
        throw error(401, "Unauthorized")
    }

    return json(user)
}