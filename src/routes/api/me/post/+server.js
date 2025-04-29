import { json, error } from "@sveltejs/kit"
import { post as Post } from "$lib/data/model/post.js"
import { user as User } from "$lib/data/model/user.js"

export const POST = async ({ request, locals }) => {
    // Check authentication
    if (!locals.user) {
        throw error(401, "Unauthorized")
    }

    try {
        const data = await request.json()
        
        // Validate required fields
        if (!data.content) {
            throw error(400, "Content is required")
        }

        // Create new post
        const newPost = await Post.create({
            author: locals.user.id,
            timestamp: new Date(),
            content: {
                items: data.content.items || [],
                text: data.content.text || "",
                location: data.content.location || "",
                tags: data.content.tags || []
            }
        })

        console.log("NEW POST", newPost)

        // Add post to user's posts array
        const user = await User.findByIdAndUpdate(
            locals.user.id,
            { $push: { posts: newPost._id.toString() } }
        ).lean()

        console.log("USER UPDATED", user)

        // Return the created post
        return json({
            id: newPost._id,
            author: newPost.author,
            timestamp: newPost.timestamp,
            likes: newPost.likes,
            saves: newPost.saves,
            shares: newPost.shares,
            comments: newPost.comments,
            content: newPost.content
        })
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to create post")
    }
}
