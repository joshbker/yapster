<script>
    import { getPostById, getUserById } from "$lib/util";
    import { onMount } from "svelte";
    import { Loader2, MessageSquare, Trash2 } from "lucide-svelte";
    import { updatedUsers } from "$lib/data/userStore";
    import { toast } from "svelte-sonner";

    export let postIds = [];
    export let type = "posts"; // can be "posts", "likes", or "saves"

    let posts = [];
    let loading = true;
    let error = null;

    // Helper function to check if a URL is a video
    function isVideo(url) {
        if (!url) return false;
        return url.match(/\.(mp4|webm|ogg)($|\?)/i) !== null;
    }

    async function removeFromCollection(postId) {
        try {
            const endpoint = type === "likes" ? "like" : "save";
            const response = await fetch(`/api/me/post/${postId}/${endpoint}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error(`Failed to ${endpoint} post`);
            }

            // Remove the post from the local array
            posts = posts.filter(p => p.id !== postId);
            toast.success(`Post removed from ${type}`);
        } catch (err) {
            console.error(`Failed to remove post from ${type}:`, err);
            toast.error(`Failed to remove post from ${type}`);
        }
    }

    async function loadPosts() {
        loading = true;
        error = null;
        try {
            const loadedPosts = await Promise.all(
                postIds.map(async (id) => {
                    try {
                        const post = await getPostById(id);
                        if (!post.isDeleted) {
                            const author = await getUserById(post.author);
                            if (!author) {
                                // If we can't find the author, treat the post as deleted
                                return { ...post, isDeleted: true };
                            }
                            return { ...post, author };
                        }
                        return post;
                    } catch (err) {
                        console.error(`Failed to load post ${id}:`, err);
                        return {
                            id,
                            isDeleted: true,
                            timestamp: new Date(),
                            likes: [],
                            saves: [],
                            comments: [],
                            content: { items: [], text: "", location: "", tags: [] }
                        };
                    }
                })
            );
            posts = loadedPosts.filter(Boolean); // Filter out any undefined posts
        } catch (err) {
            console.error('Failed to load posts:', err);
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
        const authorIds = posts.filter(post => !post.isDeleted && post.author?.id).map(post => post.author.id);
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
    <div class="max-w-[1800px] mx-auto px-1">
        <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-4">
            {#each posts as post (post.id)}
                {#if post.isDeleted}
                    <!-- Only show remove button for likes and saves -->
                    {#if type === "likes" || type === "saves"}
                        <button 
                            on:click={() => removeFromCollection(post.id)}
                            class="aspect-square relative group overflow-hidden rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                        >
                            <div class="flex flex-col items-center gap-2 text-muted-foreground">
                                <p class="text-xs">Post deleted</p>
                                <Trash2 class="h-8 w-8" />
                                <p class="text-xs">Click to remove</p>
                            </div>
                        </button>
                    {:else}
                        <div class="aspect-square relative group overflow-hidden rounded-lg bg-muted/50 flex items-center justify-center">
                            <div class="flex flex-col items-center gap-2 text-muted-foreground">
                                <Trash2 class="h-8 w-8" />
                                <p class="text-xs">Post deleted</p>
                            </div>
                        </div>
                    {/if}
                {:else}
                    <a href="/p/{post.id}" class="aspect-square block relative group overflow-hidden rounded-lg hover:opacity-90 transition-opacity">
                        {#if post.content?.items?.[0]}
                            {#if isVideo(post.content.items[0])}
                                <div class="relative w-full h-full">
                                    <video 
                                        src={post.content.items[0]}
                                        class="w-full h-full object-cover"
                                        preload="metadata"
                                        muted
                                        playsinline
                                        poster={`${post.content.items[0]}#t=0.0001`}
                                        on:play|preventDefault={(e) => e.target.pause()}
                                        controls={false}
                                        webkit-playsinline
                                    >
                                        <track kind="captions">
                                    </video>
                                </div>
                            {:else}
                                <img 
                                    src={post.content.items[0]} 
                                    alt="Post preview"
                                    class="w-full h-full object-cover"
                                />
                            {/if}
                        {:else}
                            <div class="w-full h-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center">
                                <MessageSquare class="h-12 w-12 text-foreground" />
                            </div>
                        {/if}
                    </a>
                {/if}
            {/each}
        </div>
    </div>
{/if}
