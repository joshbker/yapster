import { json, error } from "@sveltejs/kit"
import { user as User } from "$lib/data/model/user.js"
import { ObjectId } from "mongodb"

export const POST = async ({ request }) => {
    try {
        const { ids } = await request.json();
        console.log('Received batch request for users:', ids);

        if (!Array.isArray(ids)) {
            console.error('Invalid request body - not an array:', ids);
            throw error(400, "Invalid request body");
        }

        // Limit the number of IDs to prevent abuse
        if (ids.length > 50) {
            console.error('Too many IDs requested:', ids.length);
            throw error(400, "Too many IDs requested");
        }

        // Convert string IDs to ObjectId instances
        const objectIds = ids.map(id => {
            try {
                return ObjectId.createFromHexString(id);
            } catch (err) {
                console.error('Invalid ObjectId:', id);
                return null;
            }
        }).filter(Boolean);

        if (objectIds.length === 0) {
            console.error('No valid ObjectIds found');
            return json([]);
        }

        // Fetch all users in one query
        const users = await User.find({
            _id: { $in: objectIds }
        }).lean();

        console.log('Found users:', users.length);

        // Map users to a consistent format
        const formattedUsers = users.map(user => ({
            id: user._id,
            username: user.username,
            name: user.name,
            image: user.image,
            banner: user.banner,
            pronouns: user.pronouns,
            bio: user.bio,
            verified: user.verified,
            followers: user.followers,
            following: user.following,
            posts: user.posts,
            likes: user.likes,
            saves: user.saves
        }));

        return json(formattedUsers);
    } catch (err) {
        console.error('Failed to fetch users batch:', err);
        throw error(500, "Failed to fetch users");
    }
} 