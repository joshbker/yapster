<script>
    import { getPostById, getUserById } from "$lib/util";
    import { onMount } from "svelte";
    import { Loader2 } from "lucide-svelte";
    import { updatedUsers } from "$lib/data/userStore";
    import Post from "$lib/component/post/Post.svelte";

    export let postIds = [];
    export let viewer;

    let posts = [];
    let loading = true;
    let error = null;

    async function loadPosts() {
        loading = true;
        error = null;
        try {
            const loadedPosts = await Promise.all(
                postIds.map(async (id) => {
                    const post = await getPostById(id);
                    const author = await getUserById(post.author);
                    return { ...post, author };
                })
            );
            posts = loadedPosts;
        } catch (err) {
            error = "Failed to load posts";
        } finally {
            loading = false;
        }
    }

    // Initialize data on mount and when postIds updates
    $: if (postIds) {
        loadPosts();
    }

    // Subscribe to updates for all authors in the current posts
    $: {
        const authorIds = posts.map(post => post.author.id);
        const needsUpdate = authorIds.some(id => $updatedUsers.has(id));
        if (needsUpdate) {
            loadPosts();
        }
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
            <Post {post} author={post.author} {viewer} />
        {/each}
    </div>
{/if} 