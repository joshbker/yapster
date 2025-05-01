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

        // Get all comments with author details
        const comments = await Promise.all(
            post.comments.map(async (commentId) => {
                const comment = await Comment.findById(commentId).lean()
                if (!comment) return null

                return {
                    id: comment._id,
                    text: comment.text,
                    timestamp: comment.timestamp,
                    likes: comment.likes,
                    author: comment.author
                }
            })
        )

        // Filter out any null comments (in case some were deleted)
        // Sort comments by likes count in descending order, then by timestamp
        const sortedComments = comments
            .filter(Boolean)
            .sort((a, b) => {
                const likeDiff = (b.likes?.length || 0) - (a.likes?.length || 0)
                // If likes are equal, sort by timestamp (newest first)
                if (likeDiff === 0) {
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                }
                return likeDiff
            })

        return json(sortedComments)
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to fetch comments")
    }
}

export const POST = async ({ params, request, locals }) => {
    const { id } = params
    const { text } = await request.json()

    // Check if user is authenticated
    if (!locals.user) {
        throw error(401, "Unauthorized")
    }

    try {
        // Find the post
        const post = await Post.findById(id)
        if (!post) {
            throw error(404, "Post not found")
        }

        // Create new comment
        const comment = await Comment.create({
            text,
            author: locals.user.id,
            timestamp: new Date(),
            post: id
        })

        // Add comment ID to post's comments array
        post.comments.push(comment._id)
        await post.save()

        // Find the user and add comment to their comments array
        const user = await User.findById(locals.user.id)
        user.comments.push(comment._id)
        await user.save()

        // Get author details for response
        const author = await User.findById(locals.user.id).lean()

        // Return the new comment with author details
        return json({
            id: comment._id,
            text: comment.text,
            timestamp: comment.timestamp,
            author: author._id
        })
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to create comment")
    }
} 