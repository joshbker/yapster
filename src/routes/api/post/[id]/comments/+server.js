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
                post: 1,
                parentId: 1  // Include parentId in the response
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
            post: comment.post,
            parentId: comment.parentId
        }));

        return json(transformedComments);
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to fetch comments")
    }
}

export const POST = async ({ params, request, locals }) => {
    const { id } = params
    const { text, parentId } = await request.json()

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

        // If this is a reply, verify parent comment exists and belongs to the same post
        if (parentId) {
            const parentComment = await Comment.findOne({ _id: parentId, post: id });
            if (!parentComment) {
                throw error(404, "Parent comment not found or does not belong to this post");
            }
        }

        // Create new comment
        const comment = await Comment.create({
            text,
            author: locals.user.id,
            timestamp: new Date(),
            post: id,
            parentId: parentId || null
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

        // Return the new comment
        return json({
            id: comment._id,
            text: comment.text,
            timestamp: comment.timestamp,
            author: locals.user.id,
            post: comment.post,
            parentId: comment.parentId,
            likes: []
        });
    } catch (err) {
        console.error(err)
        throw error(500, "Failed to create comment")
    }
} 