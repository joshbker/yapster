<script>
    import { getPostById, getUserById } from "$lib/util";
    import { onMount } from "svelte";
    import { Loader2, MessageSquare } from "lucide-svelte";
    import { updatedUsers } from "$lib/data/userStore";

    export let postIds = [];

    let posts = [];
    let loading = true;
    let error = null;
    let thumbnails = new Map();

    // Helper function to check if a URL is a video
    function isVideo(url) {
        if (!url) return false;
        return url.match(/\.(mp4|webm|ogg)($|\?)/i) !== null;
    }

    // Function to generate video thumbnail
    function generateThumbnail(video, postId) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnails.set(postId, canvas.toDataURL());
        thumbnails = thumbnails; // Trigger Svelte reactivity
    }

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
    <div class="max-w-[1800px] mx-auto px-1">
        <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-4">
            {#each posts as post (post.id)}
                <a href="/p/{post.id}" class="aspect-square block relative group overflow-hidden rounded-lg hover:opacity-90 transition-opacity">
                    {#if post.content?.items?.[0]}
                        {#if isVideo(post.content.items[0])}
                            <div class="relative w-full h-full">
                                {#if thumbnails.get(post.id)}
                                    <img 
                                        src={thumbnails.get(post.id)} 
                                        alt="Video thumbnail"
                                        class="w-full h-full object-cover"
                                    />
                                {/if}
                                <video 
                                    src={post.content.items[0]}
                                    class="hidden"
                                    preload="metadata"
                                    muted
                                    on:loadeddata={(e) => generateThumbnail(e.target, post.id)}
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
            {/each}
        </div>
    </div>
{/if}
