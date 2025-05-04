import { writable } from 'svelte/store';

// Create a store that tracks which posts have been deleted
export const deletedPosts = writable(new Set());

// Function to trigger updates for deleted posts
export function triggerPostDelete(...ids) {
    deletedPosts.update(items => {
        ids.forEach(id => items.add(id));
        return items;
    });
} 