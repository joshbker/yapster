import { writable } from 'svelte/store';

// Create a store that tracks which users need updates
export const updatedUsers = writable(new Set());

// Function to trigger updates for specific users
export function triggerProfileUpdate(...userIds) {
    updatedUsers.update(users => {
        userIds.forEach(id => users.add(id));
        return users;
    });
    
    // Remove only these specific userIds after a short delay
    setTimeout(() => {
        updatedUsers.update(users => {
            userIds.forEach(id => users.delete(id));
            return users;
        });
    }, 100);
} 