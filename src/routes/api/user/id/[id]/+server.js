import { json, error } from "@sveltejs/kit"
import { user as User } from "$lib/data/model/user.js"

export const GET = async ({ params }) => {
    const { id } = params

    try {
        const user = await User.findById(id).lean()
        
        if (!user) {
            throw error(404, "User not found")
        }

        return json({
            username: user.username,
            name: user.name,
            image: user.image,
            banner: user.banner,
            pronouns: user.pronouns,
            bio: user.bio,
            verified: user.verified,
            followers: user.followers,
            following: user.following,
            posts: user.posts,
            likes: user.likes,
        })
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to fetch user")
    }
}
