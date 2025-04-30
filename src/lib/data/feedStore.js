import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Create a store for the feed tab
const feedTab = writable('for-you');

// Initialize the store from localStorage if in browser
if (browser) {
    const storedTab = localStorage.getItem('feedTab');
    if (storedTab) {
        feedTab.set(storedTab);
    }

    // Subscribe to changes and update localStorage
    feedTab.subscribe(value => {
        localStorage.setItem('feedTab', value);
    });
}

export { feedTab }; 