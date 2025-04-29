import { json, error } from "@sveltejs/kit"
import { post as Post } from "$lib/data/model/post.js"
import { user as User } from "$lib/data/model/user.js"

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
            shares: post.shares,
            comments: post.comments,
            content: post.content
        })
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to fetch post")
    }
}
