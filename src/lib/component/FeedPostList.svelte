<script>
    import { getPostById, getUserById } from "$lib/util";
    import { onMount } from "svelte";
    import { getTimeAgo } from "$lib/util";
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public";
    import BadgeVerified from "./BadgeVerified.svelte";
    import { Loader2, Heart, MessageCircle, Bookmark, Forward } from "lucide-svelte";
    import { updatedUsers } from "$lib/data/userStore";
    import { Button } from "$lib/component/ui/button";
    import MediaItem from "./post/MediaItem.svelte";

    export let postIds = [];
    export let viewer;

    let posts = [];
    let loading = true;
    let error = null;

    // Store for caching author data to avoid duplicate fetches
    let authorCache = new Map();

    function isVideo(url) {
        // Check common video extensions
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        const urlLower = url.toLowerCase();
        return videoExtensions.some(ext => urlLower.endsWith(ext));
    }

    async function loadPosts() {
        loading = true;
        error = null;
        try {
            // Load all posts first
            const loadedPosts = await Promise.all(
                postIds.map(id => getPostById(id))
            );

            // Get unique author IDs
            const authorIds = [...new Set(loadedPosts.map(post => post.author))];

            // Fetch all authors in parallel
            const authors = await Promise.all(
                authorIds.map(async (authorId) => {
                    if (authorCache.has(authorId)) {
                        return authorCache.get(authorId);
                    }
                    const author = await getUserById(authorId);
                    authorCache.set(authorId, author);
                    return author;
                })
            );

            // Create a map of author data for quick lookup
            const authorMap = new Map(authors.map(author => [author.id, author]));

            // Combine posts with their author data
            posts = loadedPosts.map(post => ({
                ...post,
                author: authorMap.get(post.author)
            }));
        } catch (err) {
            console.error('Error loading feed:', err);
            error = "Failed to load posts";
        } finally {
            loading = false;
        }
    }

    // Initialize data on mount and when postIds updates
    $: if (postIds) {
        loadPosts();
    }

    // Subscribe to user updates and refresh posts if any author was updated
    $: if ($updatedUsers.size > 0) {
        const shouldRefresh = posts.some(post => $updatedUsers.has(post.author?.id));
        if (shouldRefresh) {
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
        No posts yet. Follow some users to see their posts here!
    </div>
{:else}
    <div class="flex flex-col gap-4">
        {#each posts as post (post.id)}
            <div class="border rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <a 
                        href="/{post.author.username}" 
                        class="shrink-0"
                    >
                        <img 
                            src={post.author.image ?? PUBLIC_DEFAULT_AVATAR_URL} 
                            alt="Avatar" 
                            class="w-10 h-10 rounded-full object-cover"
                        >
                    </a>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <a 
                                href="/{post.author.username}"
                                class="flex items-center gap-2.5 hover:underline"
                            >
                                <div class="flex items-center gap-1.5">
                                    <span class="font-semibold truncate">{post.author.name ?? post.author.username}</span>
                                    {#if post.author.verified}
                                        <BadgeVerified size={16} />
                                    {/if}
                                </div>
                                {#if post.author.name}
                                    <p class="text-sm font-medium text-muted-foreground truncate">@{post.author.username}</p>
                                {/if}
                            </a>
                            <span class="text-muted-foreground text-sm shrink-0">{getTimeAgo(new Date(post.timestamp))}</span>
                        </div>
                        {#if post.content.text}
                            <p class="mt-2 whitespace-pre-wrap text-sm break-words">{post.content.text}</p>
                        {/if}
                        {#if post.content.items && post.content.items.length > 0}
                            <div class="mt-3 grid gap-2" class:grid-cols-2={post.content.items.length > 1}>
                                {#each post.content.items as item}
                                    <div class="aspect-square">
                                        <MediaItem {item} isVideo={isVideo(item)} />
                                    </div>
                                {/each}
                            </div>
                        {/if}
                        <div class="mt-3 flex items-center justify-between">
                            <div class="flex items-center gap-1 -ml-1.5">
                                <Button variant="ghost" size="sm" class="flex items-center gap-2 h-8 px-2 hover:!text-red-500">
                                    <Heart class="h-5 w-5" />
                                    <span>{post.likes?.length ?? 0}</span>
                                </Button>
                                <Button variant="ghost" size="sm" class="flex items-center gap-2 h-8 px-2 hover:!text-blue-500">
                                    <MessageCircle class="h-5 w-5" />
                                    <span>{post.comments?.length ?? 0}</span>
                                </Button>
                                <Button variant="ghost" size="sm" class="flex items-center gap-2 h-8 px-2 hover:!text-green-500">
                                    <Forward class="h-5 w-5" />
                                </Button>
                            </div>
                            <Button variant="ghost" size="sm" class="flex items-center gap-2 h-8 px-2 hover:!text-yellow-500">
                                <Bookmark class="h-5 w-5" />
                                <span>{post.saves?.length ?? 0}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if} 