import { getUserById } from '$lib/util';

export const load = async ({ data }) => {
    if (!data.user) {
        return {
            ...data
        }
    }

    const user = data.displayedUser;

    // Start loading followers and following in the background
    const followingPromise = user.following?.length 
        ? Promise.all(user.following.map(id => getUserById(id)))
        : Promise.resolve([]);
    
    const followersPromise = user.followers?.length 
        ? Promise.all(user.followers.map(id => getUserById(id)))
        : Promise.resolve([]);

    return {
        ...data,
        streamed: {
            following: followingPromise,
            followers: followersPromise
        }
    };
}; 