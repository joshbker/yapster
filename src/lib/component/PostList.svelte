<script>
    import { getPostById } from "$lib/util";
    import { onMount } from "svelte";
    import { getTimeAgo } from "$lib/util";
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public";
    import BadgeVerified from "./BadgeVerified.svelte";
    import { Loader2, Heart, MessageCircle, Bookmark, Forward } from "lucide-svelte";
    import { updatedUsers } from "$lib/data/userStore";
    import { Button } from "$lib/component/ui/button";

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
    <div class="flex flex-col gap-4">
        {#each posts as post (post.id)}
            <div class="border rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <img 
                        src={user.image ?? PUBLIC_DEFAULT_AVATAR_URL} 
                        alt="Avatar" 
                        class="w-10 h-10 rounded-full object-cover"
                    >
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2.5">
                                <div class="flex items-center gap-1.5">
                                    <span class="font-semibold">{user.name ?? user.username}</span>
                                    {#if user.verified}
                                        <BadgeVerified size={16} />
                                    {/if}
                                </div>
                                {#if user.name}
                                    <p class="text-sm font-medium text-muted-foreground">{user.username}</p>
                                {/if}
                            </div>
                            <span class="text-muted-foreground text-sm">{getTimeAgo(new Date(post.timestamp))}</span>
                        </div>
                        {#if post.content.text}
                            <p class="mt-2 whitespace-pre-wrap text-sm">{post.content.text}</p>
                        {/if}
                        {#if post.content.items && post.content.items.length > 0}
                            <div class="mt-3 grid gap-2" class:grid-cols-2={post.content.items.length > 1}>
                                {#each post.content.items as item}
                                    <img src={item} alt="Post media" class="rounded-lg w-full h-full object-cover">
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
                                    <span>{post.shares ?? 0}</span>
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