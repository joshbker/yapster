import { json, error } from "@sveltejs/kit"
import { post as Post } from "$lib/data/model/post.js"
import { user as User } from "$lib/data/model/user.js"
import { validatePost } from "$lib/validationUtil"

export const POST = async ({ request, locals }) => {
    // Check authentication
    if (!locals.user) {
        throw error(401, { message: "Unauthorized - user not logged in" })
    }

    try {
        let data
        try {
            data = await request.json()
        } catch (jsonError) {
            console.error("Post creation JSON parse error:", jsonError)
            throw error(400, { message: "Invalid JSON in request body" })
        }
        
        // Validate content
        if (!data.content) {
            throw error(400, { message: "Content field is required" })
        }

        // Validate and sanitize the post content
        let validatedContent
        try {
            validatedContent = validatePost(data.content)
        } catch (validationError) {
            console.error("Post validation error:", validationError)
            // If it's already a SvelteKit error, rethrow it
            if (validationError.status) {
                throw error(validationError.status, { message: validationError.body?.message || validationError.message || "Invalid post content" })
            }
            // Otherwise create a new error
            throw error(400, { message: validationError.message || "Invalid post content" })
        }

        // Create new post
        let newPost
        try {
            newPost = await Post.create({
                author: locals.user.id,
                timestamp: new Date(),
                content: validatedContent
            })
        } catch (dbError) {
            console.error("Database error creating post:", dbError)
            throw error(500, { message: "Database error creating post" })
        }

        console.log("Post created successfully:", {
            id: newPost._id,
            author: newPost.author,
            contentLength: JSON.stringify(newPost.content).length
        })

        // Add post to user's posts array
        try {
            const user = await User.findByIdAndUpdate(
                locals.user.id,
                { $push: { posts: newPost._id.toString() } }
            ).lean()

            if (!user) {
                console.error("User not found when updating posts array:", locals.user.id)
                throw error(404, { message: "User not found" })
            }

            console.log("User posts array updated:", {
                userId: user._id,
                postCount: (user.posts || []).length + 1
            })
        } catch (userUpdateError) {
            console.error("Error updating user's posts array:", userUpdateError)
            // Post was created but user update failed - this is a partial success
            // We should return success but log the error
            console.warn("Post created but user's posts array not updated:", {
                postId: newPost._id,
                userId: locals.user.id,
                error: userUpdateError.message
            })
        }

        // Return the created post
        return json({
            id: newPost._id,
            author: newPost.author,
            timestamp: newPost.timestamp,
            likes: newPost.likes,
            saves: newPost.saves,
            comments: newPost.comments,
            content: newPost.content
        })
    } catch (err) {
        console.error("Post creation error:", err)
        
        // If it's already a SvelteKit error with status and message, throw it directly
        if (err.status) {
            throw error(err.status, { message: err.body?.message || err.message || "Error creating post" })
        }
        
        // Handle other errors with a generic message
        throw error(500, { message: "Server error: Failed to create post" })
    }
}
