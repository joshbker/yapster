<script>
    import { Loader2 } from "lucide-svelte";
    import CreateComment from "./CreateComment.svelte";
    import Comment from "./Comment.svelte";
    import { onMount } from "svelte";

    export let post;
    export let viewer;

    let comments = [];
    let loading = true;
    let error = null;

    // Function to organize comments into a tree structure
    function organizeCommentsIntoTree(flatComments) {
        const commentMap = new Map();
        const rootComments = [];

        // First pass: Create a map of all comments
        flatComments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: Organize into tree structure
        flatComments.forEach(comment => {
            const commentWithReplies = commentMap.get(comment.id);
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) {
                    parent.replies.push(commentWithReplies);
                }
            } else {
                rootComments.push(commentWithReplies);
            }
        });

        // Sort replies chronologically (oldest first)
        commentMap.forEach(comment => {
            if (comment.replies.length > 0) {
                comment.replies.sort((a, b) => {
                    // First by likes
                    const likeDiff = (b.likes?.length || 0) - (a.likes?.length || 0);
                    if (likeDiff !== 0) return likeDiff;
                    // Then by timestamp (oldest first for replies)
                    return new Date(a.timestamp) - new Date(b.timestamp);
                });
            }
        });

        return rootComments;
    }

    async function loadComments() {
        loading = true;
        error = null;
        try {
            const response = await fetch(`/api/post/${post.id}/comments`);
            if (!response.ok) {
                throw new Error('Failed to load comments');
            }
            const data = await response.json();
            comments = organizeCommentsIntoTree(data);
            // Sort root comments by likes (desc) and timestamp (desc)
            comments.sort((a, b) => {
                // First by likes
                const likeDiff = (b.likes?.length || 0) - (a.likes?.length || 0);
                if (likeDiff !== 0) return likeDiff;
                // Then by timestamp (newest first for root comments)
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
        } catch (err) {
            error = "Failed to load comments";
            console.error(err);
        } finally {
            loading = false;
        }
    }

    function handleCommentCreated(newComment) {
        // Ensure new comment has a replies array
        newComment = { ...newComment, replies: [] };
        
        if (newComment.parentId) {
            // Find the parent comment and add the reply
            function addReplyToParent(commentList) {
                for (let comment of commentList) {
                    if (comment.id === newComment.parentId) {
                        comment.replies = [newComment, ...comment.replies];
                        return true;
                    }
                    if (comment.replies && addReplyToParent(comment.replies)) {
                        return true;
                    }
                }
                return false;
            }
            addReplyToParent(comments);
        } else {
            comments = [newComment, ...comments];
        }
    }

    onMount(() => {
        loadComments();
    });
</script>

<div class="w-full space-y-4">
    {#if viewer}
        <CreateComment 
            postId={post.id}
            {viewer}
            onCommentCreated={handleCommentCreated}
        />
    {/if}

    {#if loading}
        <div class="w-full flex justify-center py-8">
            <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    {:else if error}
        <div class="w-full text-center py-8 text-destructive text-sm">
            {error}
        </div>
    {:else if comments.length === 0}
        <div class="w-full text-center py-8 text-muted-foreground text-sm">
            No comments yet.
        </div>
    {:else}
        <div class="w-full space-y-4">
            {#each comments as comment (comment.id)}
                <Comment {comment} {viewer} onCommentCreated={handleCommentCreated} />
            {/each}
        </div>
    {/if}
</div>
