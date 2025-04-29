<script>
    import { getPostById } from "$lib/util";
    import { onMount } from "svelte";
    import { Loader2 } from "lucide-svelte";
    import { updatedUsers } from "$lib/data/userStore";
    import PostCard from "$lib/component/post/PostCard.svelte";

    export let postIds = [];
    export let user;
    export let viewer;

    let posts = [];
    let loading = true;
    let error = null;

    async function loadPosts() {
        loading = true;
        error = null;
        try {
            const loadedPosts = await Promise.all(
                postIds.map(id => getPostById(id))
            );
            posts = loadedPosts;
        } catch (err) {
            error = "Failed to load posts";
        } finally {
            loading = false;
        }
    }

    // Initialize data on mount and when user or postIds updates
    $: if (user && postIds) {
        loadPosts();
    }

    // Subscribe to updates for this specific user
    $: if ($updatedUsers.has(user.id)) {
        loadPosts();
    }

    onMount(() => {
        loadPosts();
    });
</script>

{#if loading}
    <div class="flex justify-center py-8">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
{:else if error}
    <div class="text-center py-8 text-destructive text-sm">
        {error}
    </div>
{:else if posts.length === 0}
    <div class="text-center py-8 text-muted-foreground text-sm">
        No posts yet.
    </div>
{:else}
    <div class="flex flex-col gap-4 max-w-xl mx-auto">
        {#each posts as post (post.id)}
            <PostCard {post} {user} {viewer} />
        {/each}
    </div>
{/if} 