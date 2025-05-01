import { writable } from 'svelte/store';

// Create a store that tracks which posts/comments need like updates
export const updatedLikes = writable(new Set());

// Function to trigger updates for specific posts/comments
export function triggerLikeUpdate(...ids) {
    updatedLikes.update(items => {
        ids.forEach(id => items.add(id));
        return items;
    });
    
    // Remove only these specific ids after a short delay
    setTimeout(() => {
        updatedLikes.update(items => {
            ids.forEach(id => items.delete(id));
            return items;
        });
    }, 100);
} 