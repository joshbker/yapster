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

    async function loadComments() {
        loading = true;
        error = null;
        try {
            const response = await fetch(`/api/post/${post.id}/comments`);
            if (!response.ok) {
                throw new Error('Failed to load comments');
            }
            const data = await response.json();
            comments = data;
        } catch (err) {
            error = "Failed to load comments";
            console.error(err);
        } finally {
            loading = false;
        }
    }

    function handleCommentCreated(newComment) {
        comments = [newComment, ...comments];
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
                <Comment {comment} {viewer} />
            {/each}
        </div>
    {/if}
</div>
