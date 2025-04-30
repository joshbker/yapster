import { json, error } from "@sveltejs/kit"
import { user as User } from "$lib/data/model/user.js"

export const GET = async ({ params, locals }) => {
    const { username } = params

    try {
        const user = await User.findOne({
            username: username.toLowerCase()
        }).lean()
        
        if (!user) {
            throw error(404, "User not found")
        }

        if (!locals.user) {
            return json({
                username: user.username,
                name: user.name,
                image: user.image,
                banner: user.banner,
                pronouns: user.pronouns,
                bio: user.bio,
                verified: user.verified,
                followers: user.followers.length,
                following: user.following.length,
                posts: user.posts.length
            })
        }

        return json({
            id: user._id,
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
        throw error(500, "Failed to check username")
    }
}