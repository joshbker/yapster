import { error } from "@sveltejs/kit";
import { user as User } from "$lib/data/model/user.js";
import { post as Post } from "$lib/data/model/post.js";

export const load = async ({ locals }) => {
    if (!locals.user) {
        return {
            user: null
        };
    }

    try {
        // Get all posts sorted by timestamp
        const posts = await Post.find({})
            .sort({ timestamp: -1 }) // Sort by timestamp descending (newest first)
            .lean();

        return {
            user: locals.user,
            posts: posts.map(post => post._id.toString()) // Convert ObjectIds to strings
        };
    } catch (err) {
        console.error("Error loading feed:", err);
        throw error(500, "Failed to load feed");
    }
}; 