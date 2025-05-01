import { json, error } from "@sveltejs/kit"
import { comment as Comment } from "$lib/data/model/comment.js"
import { user as User } from "$lib/data/model/user.js"

export const PATCH = async ({ params, locals }) => {
    const { commentId } = params
    const currentUser = locals.user

    if (!currentUser) {
        throw error(401, "Unauthorized")
    }

    try {
        // Find the comment
        const comment = await Comment.findById(commentId)
        if (!comment) {
            throw error(404, "Comment not found")
        }

        // Check if already liked
        const isLiked = comment.likes.includes(currentUser.id)
        
        // Use Promise.all to update both comment and user atomically
        await Promise.all([
            Comment.bulkWrite([
                {
                    updateOne: {
                        filter: { _id: commentId },
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
                            ? { $pull: { likedComments: commentId } }
                            : { $addToSet: { likedComments: commentId } }
                    }
                }
            ])
        ])

        // Get updated comment for accurate count
        const updatedComment = await Comment.findById(commentId).lean()

        return json({
            success: true,
            liked: !isLiked,
            likeCount: updatedComment.likes.length
        })
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to like/unlike comment")
    }
} 