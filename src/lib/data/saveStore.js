import { writable } from 'svelte/store';

// Create a store that tracks which posts need save updates
export const updatedSaves = writable(new Set());

// Function to trigger updates for specific posts
export function triggerSaveUpdate(...ids) {
    updatedSaves.update(items => {
        ids.forEach(id => items.add(id));
        return items;
    });
    
    // Remove only these specific ids after a short delay
    setTimeout(() => {
        updatedSaves.update(items => {
            ids.forEach(id => items.delete(id));
            return items;
        });
    }, 100);
} 