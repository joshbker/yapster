import { error } from "@sveltejs/kit";
import { user as User } from "$lib/data/model/user.js";
import { post as Post } from "$lib/data/model/post.js";

export const load = async ({ locals }) => {
    try {
        // Get current user's data including their following list
        const currentUser = await User.findById(locals.user.id).lean();
        
        if (!currentUser) {
            throw error(404, "User not found");
        }


        const followingIds = currentUser.following || [];

        if (followingIds.length === 0) {    
            return {
                user: locals.user,
                posts: []
            };
        }

        // Get posts from all relevant users
        const posts = await Post.find({
            author: { $in: followingIds }
        })
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