import { writable } from 'svelte/store';

// Store for caching posts
export const postCache = writable(new Map());

// Function to get a post from cache or fetch it
export async function getCachedPost(id) {
    let cache;
    postCache.subscribe(value => {
        cache = value;
    })();

    // If post is in cache and not older than 5 minutes, return it
    const cachedPost = cache.get(id);
    if (cachedPost && (Date.now() - cachedPost.cachedAt) < 300000) {
        return cachedPost.data;
    }

    // If not in cache or too old, remove from cache
    cache.delete(id);
    return null;
}

// Function to add a post to cache
export function cachePost(id, post) {
    postCache.update(cache => {
        cache.set(id, {
            data: post,
            cachedAt: Date.now()
        });
        return cache;
    });
}

// Function to clear the cache for specific posts
export function clearPostCache(...ids) {
    postCache.update(cache => {
        ids.forEach(id => cache.delete(id));
        return cache;
    });
}

// Function to clear the entire cache
export function clearAllPostCache() {
    postCache.set(new Map());
} 