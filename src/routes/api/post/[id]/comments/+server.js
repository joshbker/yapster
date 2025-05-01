import { json, error } from "@sveltejs/kit"
import { post as Post } from "$lib/data/model/post.js"
import { user as User } from "$lib/data/model/user.js"
import { comment as Comment } from "$lib/data/model/comment.js"

export const GET = async ({ params }) => {
    const { id } = params

    try {
        // Use aggregation to get comments with post verification in a single query
        const comments = await Comment.aggregate([
            // Match comments for this post
            { $match: { post: id } },
            // Sort by likes count (desc) and timestamp (desc)
            { $sort: { 
                "likes.length": -1,
                timestamp: -1 
            }},
            // Project only the fields we need
            { $project: {
                _id: 1,
                text: 1,
                timestamp: 1,
                likes: 1,
                author: 1,
                post: 1  // Include the post ID in the response
            }}
        ]);

        if (comments.length === 0) {
            // Verify post exists if no comments found
            const postExists = await Post.exists({ _id: id });
            if (!postExists) {
                throw error(404, "Post not found");
            }
        }

        // Transform _id to id for consistency
        const transformedComments = comments.map(comment => ({
            id: comment._id,
            text: comment.text,
            timestamp: comment.timestamp,
            likes: comment.likes,
            author: comment.author,
            post: comment.post
        }));

        return json(transformedComments);
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
        // First verify post exists
        const postExists = await Post.exists({ _id: id });
        if (!postExists) {
            throw error(404, "Post not found");
        }

        // Create new comment
        const comment = await Comment.create({
            text,
            author: locals.user.id,
            timestamp: new Date(),
            post: id
        });

        // Update both post and user in parallel using bulkWrite
        await Promise.all([
            Post.bulkWrite([
                {
                    updateOne: {
                        filter: { _id: id },
                        update: { $addToSet: { comments: comment._id } }
                    }
                }
            ]),
            User.bulkWrite([
                {
                    updateOne: {
                        filter: { _id: locals.user.id },
                        update: { $addToSet: { comments: comment._id } }
                    }
                }
            ])
        ]);

        // Return the new comment (no need to fetch author details since we have the ID)
        return json({
            id: comment._id,
            text: comment.text,
            timestamp: comment.timestamp,
            author: locals.user.id
        });
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to create comment")
    }
} 