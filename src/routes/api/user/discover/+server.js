import { json, error } from "@sveltejs/kit"
import { user as User } from "$lib/data/model/user.js"
import { ObjectId } from "mongodb"

export const GET = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, "Unauthorized")
    }

    try {
        const users = await User.aggregate([
            { $match: { _id: { $ne: ObjectId.createFromHexString(locals.user.id) } } },
            { 
                $addFields: {
                    followersCount: { $size: "$followers" }
                }
            },
            { $sort: { followersCount: -1 } }
        ])
        
        if (!users) {
            throw error(404, "Users not found")
        }

        return json(users.map(user => ({
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
            likes: user.likes
        })))
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to check username")
    }
}