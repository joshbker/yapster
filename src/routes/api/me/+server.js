import { json, error } from "@sveltejs/kit"
import { user as User } from "$lib/data/model/user.js"

export const GET = async ({ locals }) => json(locals.user)

export const PATCH = async ({ locals, request }) => {
    if (!locals.user) {
        throw error(401, "Unauthorized")
    }

    try {
        const updates = await request.json()
        const allowedFields = ['username', 'name', 'image', 'banner', 'pronouns', 'bio']
        const sanitizedUpdates = {}

        // Only allow updating specific fields
        for (const field of allowedFields) {
            if (field in updates) {
                sanitizedUpdates[field] = updates[field]
            }
        }

        // If trying to update username, ensure it's lowercase and unique
        if (sanitizedUpdates.username) {
            sanitizedUpdates.username = sanitizedUpdates.username.toLowerCase()
            
            // Check if username is already taken
            const existingUser = await User.findOne({
                username: sanitizedUpdates.username,
                _id: { $ne: locals.user.id }
            })

            if (existingUser) {
                throw error(400, "Username already taken")
            }
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            locals.user.id,
            { $set: sanitizedUpdates },
            { new: true, runValidators: true }
        ).lean()

        if (!updatedUser) {
            throw error(404, "User not found")
        }

        return json({
            id: updatedUser._id,
            username: updatedUser.username,
            name: updatedUser.name,
            image: updatedUser.image,
            banner: updatedUser.banner,
            pronouns: updatedUser.pronouns,
            bio: updatedUser.bio,
            verified: updatedUser.verified,
            followers: updatedUser.followers,
            following: updatedUser.following,
            posts: updatedUser.posts,
            likes: updatedUser.likes
        })
    } catch (err) {
        console.error(err)
        if (err.status === 400 || err.status === 401 || err.status === 404) {
            throw err
        }
        throw error(500, "Failed to update profile")
    }
}