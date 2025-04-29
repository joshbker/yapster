import { json, error } from "@sveltejs/kit"
import { user as User } from "$lib/data/model/user.js"

export const PATCH = async ({ params, locals }) => {
    const { id } = params
    const currentUser = locals.user

    if (!currentUser) {
        throw error(401, "Unauthorized")
    }

    try {
        // Find the user to follow
        const userToFollow = await User.findOne({
            _id: id
        })

        if (!userToFollow) {
            throw error(404, "User not found")
        }

        // Don't allow following yourself
        if (userToFollow._id.toString() === currentUser.id) {
            throw error(400, "Cannot follow yourself")
        }

        // Check if already following
        const isFollowing = userToFollow.followers.includes(currentUser.id)
        
        if (isFollowing) {
            // Unfollow: Remove IDs from both arrays
            await User.updateOne(
                { _id: userToFollow._id },
                { $pull: { followers: currentUser.id } }
            )
            await User.updateOne(
                { _id: currentUser.id },
                { $pull: { following: userToFollow._id.toString() } }
            )
        } else {
            // Follow: Add IDs to both arrays
            await User.updateOne(
                { _id: userToFollow._id },
                { $addToSet: { followers: currentUser.id } }
            )
            await User.updateOne(
                { _id: currentUser.id },
                { $addToSet: { following: userToFollow._id.toString() } }
            )
        }

        return json({ success: true, following: !isFollowing })
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to follow/unfollow user")
    }
}