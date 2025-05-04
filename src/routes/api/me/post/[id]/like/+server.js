import { json, error } from "@sveltejs/kit"
import { user as User } from "$lib/data/model/user.js"
import { post as Post } from "$lib/data/model/post.js"

export const PATCH = async ({ params, locals }) => {
    const { id } = params
    const currentUser = locals.user

    try {
        // Find the post to like
        const postToLike = await Post.findOne({
            _id: id
        })

        if (!postToLike) {
            throw error(404, "Post not found")
        }

        // Check if already liked
        const isLiked = postToLike.likes.includes(currentUser.id)
        
        // Use bulkWrite for atomic operations on both post and user
        await Promise.all([
            Post.bulkWrite([
                {
                    updateOne: {
                        filter: { _id: postToLike._id },
                        update: isLiked 
                            ? { $pull: { likes: currentUser.id } }
                            : { $addToSet: { likes: currentUser.id } }
                    }
                }
            ]),
            User.bulkWrite([
                {
                    updateOne: {
                        filter: { _id: currentUser.id },
                        update: isLiked
                            ? { $pull: { likes: postToLike._id.toString() } }
                            : { $addToSet: { likes: postToLike._id.toString() } }
                    }
                }
            ])
        ])

        // Get updated post data for accurate count
        const updatedPost = await Post.findById(postToLike._id).lean()

        return json({
            success: true,
            liked: !isLiked,
            likeCount: updatedPost.likes.length
        })
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to like/unlike post")
    }
}

export const DELETE = async ({ params, locals }) => {
    const { id } = params
    const currentUser = locals.user

    try {
        // Remove post ID from user's likes array
        await User.updateOne(
            { _id: currentUser.id },
            { $pull: { likes: id } }
        )

        return json({
            success: true
        })
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to remove post from likes")
    }
}
