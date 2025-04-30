import { error } from '@sveltejs/kit';
import { getUserByUsername } from '$lib/util';

export async function load({ params }) {
    const displayedUser = await getUserByUsername(params.username);
    
    if (!displayedUser) {
        throw error(404, {
            message: 'User not found'
        });
    }

    return {
        displayedUser: displayedUser
    };
} 