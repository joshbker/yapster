import { json, error } from "@sveltejs/kit"
import { user as User } from "$lib/data/model/user.js"

export const PATCH = async ({ params, locals }) => {
    const { id } = params
    const currentUser = locals.user

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
        
        // Use bulkWrite for atomic operations on both users
        await User.bulkWrite([
            {
                updateOne: {
                    filter: { _id: userToFollow._id },
                    update: isFollowing 
                        ? { $pull: { followers: currentUser.id } }
                        : { $addToSet: { followers: currentUser.id } }
                }
            },
            {
                updateOne: {
                    filter: { _id: currentUser.id },
                    update: isFollowing
                        ? { $pull: { following: userToFollow._id.toString() } }
                        : { $addToSet: { following: userToFollow._id.toString() } }
                }
            }
        ])

        // Get updated user data for accurate counts
        const [updatedUserToFollow, updatedCurrentUser] = await Promise.all([
            User.findById(userToFollow._id).lean(),
            User.findById(currentUser.id).lean()
        ])

        return json({
            success: true,
            following: !isFollowing,
            followerCount: updatedUserToFollow.followers.length,
            followingCount: updatedCurrentUser.following.length
        })
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to follow/unfollow user")
    }
}