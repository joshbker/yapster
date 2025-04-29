export const load = async ({ params, fetch }) => {
    console.log("PARAMS", params)
    const { username } = params

    const user = await fetch(`/api/user/username/${username}`)

    if (!user.ok) {
        throw error(404, "User not found")
    }

    return {
        params: {
            username: params.username
        },
        user: await user.json()
    }
}