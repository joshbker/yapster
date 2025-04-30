<script>
    import { getPostById, getUserById } from "$lib/util";
    import { onMount } from "svelte";
    import { Loader2 } from "lucide-svelte";
    import Post from "$lib/component/post/Post.svelte";

    export let data;

    let post = null;
    let author = null;
    let loading = true;
    let error = null;

    async function loadPost() {
        loading = true;
        error = null;
        try {
            // Get the post ID from the URL
            const postId = window.location.pathname.split('/p/')[1];
            
            // Load the post data
            post = await getPostById(postId);
            
            // Load the author data
            author = await getUserById(post.author);
        } catch (err) {
            error = "Failed to load post";
            console.error(err);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadPost();
    });
</script>

<div class="container max-w-xl mx-auto p-4">
    {#if loading}
        <div class="flex justify-center py-8">
            <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    {:else if error}
        <div class="text-center py-8 text-destructive text-sm">
            {error}
        </div>
    {:else if !post || !author}
        <div class="text-center py-8 text-muted-foreground text-sm">
            Post not found.
        </div>
    {:else}
        <Post {post} {author} viewer={data.user} />
    {/if}
</div>
