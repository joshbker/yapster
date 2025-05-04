import { json, error } from "@sveltejs/kit"
import { post as Post } from "$lib/data/model/post.js"
import { user as User } from "$lib/data/model/user.js"
import { comment as Comment } from "$lib/data/model/comment.js"

export const GET = async ({ params }) => {
    const { id } = params

    try {
        // Find the post by ID
        const post = await Post.findById(id).lean()
        
        if (!post) {
            throw error(404, "Post not found")
        }

        // Return post with author details
        return json({
            id: post._id,
            author: post.author,
            timestamp: post.timestamp,
            likes: post.likes,
            saves: post.saves,
            comments: post.comments,
            content: post.content
        })
    } catch (err) {
        if (err.status === 404) {
            throw error(404, "Post not found")
        }
        console.error(err)
        throw error(500, "Failed to fetch post")
    }
}

export const DELETE = async ({ params, locals }) => {
    const { id } = params
    const currentUser = locals.user

    if (!currentUser) {
        throw error(401, "Unauthorized")
    }

    try {
        // Find the post first to verify ownership
        const post = await Post.findById(id)
        if (!post) {
            throw error(404, "Post not found")
        }

        // Verify the current user is the author
        if (post.author !== currentUser.id) {
            throw error(403, "You can only delete your own posts")
        }

        // 1. Delete all comments associated with the post and cleanup user's likedComments
        const comments = await Comment.find({ post: id })
        const commentIds = comments.map(comment => comment._id.toString())
        
        // Get unique comment authors to update their comments arrays
        const commentAuthors = [...new Set(comments.map(comment => comment.author))]

        // Remove comment IDs from authors' comments arrays
        if (commentAuthors.length > 0) {
            await User.updateMany(
                { _id: { $in: commentAuthors } },
                { $pull: { comments: { $in: commentIds } } }
            )
        }

        // Remove comment likes from all users who liked any of the comments
        if (commentIds.length > 0) {
            await User.updateMany(
                { likedComments: { $in: commentIds } },
                { $pull: { likedComments: { $in: commentIds } } }
            )
        }

        // Delete all comments
        await Comment.deleteMany({ post: id })

        // 2. Remove post from author's posts array
        await User.findByIdAndUpdate(
            currentUser.id,
            { $pull: { posts: id } }
        )

        // 3. Delete the post itself
        await Post.findByIdAndDelete(id)

        return json({
            success: true,
            message: "Post deleted successfully"
        })
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to delete post")
    }
}
