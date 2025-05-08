import { writable } from 'svelte/store';

export const replyingTo = writable(null);

// Store structure will be:
// null - for top level comments
// or
// { 
//   commentId: string,
//   username: string,
//   postId: string
// } 