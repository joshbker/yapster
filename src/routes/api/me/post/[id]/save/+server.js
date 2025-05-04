import { json, error } from "@sveltejs/kit"
import { user as User } from "$lib/data/model/user.js"
import { post as Post } from "$lib/data/model/post.js"

export const PATCH = async ({ params, locals }) => {
    const { id } = params
    const currentUser = locals.user

    try {
        // Find the post to save
        const postToSave = await Post.findOne({
            _id: id
        })

        if (!postToSave) {
            throw error(404, "Post not found")
        }

        // Check if already saved
        const isSaved = postToSave.saves?.includes(currentUser.id) || false
        
        // Use bulkWrite for atomic operations on both post and user
        await Promise.all([
            Post.updateOne(
                { _id: postToSave._id },
                isSaved 
                    ? { $pull: { saves: currentUser.id } }
                    : { $addToSet: { saves: currentUser.id } }
            ),
            User.updateOne(
                { _id: currentUser.id },
                isSaved
                    ? { $pull: { savedPosts: postToSave._id.toString() } }
                    : { $addToSet: { savedPosts: postToSave._id.toString() } }
            )
        ])

        // Get updated post data for accurate count
        const updatedPost = await Post.findById(postToSave._id).lean()

        return json({
            success: true,
            saved: !isSaved,
            saveCount: updatedPost.saves?.length || 0
        })
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to save/unsave post")
    }
}
