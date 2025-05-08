import { json, error } from "@sveltejs/kit"
import { comment as Comment } from "$lib/data/model/comment.js"

export const GET = async ({ params }) => {
    const { commentId } = params

    try {
        const comment = await Comment.findById(commentId).lean();
        
        if (!comment) {
            throw error(404, "Comment not found");
        }

        return json({
            id: comment._id,
            text: comment.text,
            timestamp: comment.timestamp,
            likes: comment.likes,
            author: comment.author,
            post: comment.post,
            parentId: comment.parentId
        });
    } catch (err) {
        console.error(err);
        throw error(500, "Failed to fetch comment");
    }
} 