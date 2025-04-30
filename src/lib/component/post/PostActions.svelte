<script>
    import { Heart, MessageCircle, Forward, Bookmark, MoreHorizontal, Flag, Ban, BellOff, ExternalLink } from "lucide-svelte";
    import { PUBLIC_BASE_URL } from "$env/static/public";
    import { toast } from "svelte-sonner";
    import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "$lib/component/ui/dropdown-menu"
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { writable } from 'svelte/store';

    export let post;
    export let viewer;

    const likeState = writable(false);
    const likeCount = writable(0);
    let isLikeLoading = false;
    let likeDebounceTimeout;

    // Make isLiked and likeCount fully reactive using the stores
    $: $likeState = post.likes?.includes(viewer?.id) ?? false;
    $: $likeCount = post.likes?.length ?? 0;

    // Debounced like function
    function debouncedLike() {
        if (likeDebounceTimeout) {
            clearTimeout(likeDebounceTimeout);
        }

        likeDebounceTimeout = setTimeout(like, 300);
    }

    async function like() {
        if (isLikeLoading) return;

        const wasLiked = $likeState;
        const previousCount = $likeCount;
        
        // Optimistic updates
        $likeState = !wasLiked;
        $likeCount = wasLiked ? previousCount - 1 : previousCount + 1;
        isLikeLoading = true;

        try {
            const response = await fetch(`/api/me/post/${post.id}/like`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Revert on failure
                $likeState = wasLiked;
                $likeCount = previousCount;
                const data = await response.json();
                throw new Error(data.message || 'Failed to like post');
            }

            // Update the arrays based on the action
            if (wasLiked) {
                // Unlike: Remove user ID from likes array
                post.likes = post.likes.filter(id => id !== viewer.id);
            } else {
                // Like: Add user ID to likes array
                post.likes = [...(post.likes || []), viewer.id];
            }
        } catch (err) {
            console.error('Failed to like/unlike:', err);
            toast.error(err.message);
        } finally {
            isLikeLoading = false;
        }
    }

    async function handleShare() {
        await navigator.clipboard.writeText(`${PUBLIC_BASE_URL}/p/${post.id}`);
        toast.success("Link copied to clipboard!");
    }
</script>

<div class="flex w-full justify-between">
    <div class="flex items-center gap-3">
        <button 
            class="flex items-center gap-2 transition-colors {$likeState ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}" 
            on:click={debouncedLike}
            disabled={isLikeLoading}
        >
            <Heart class="h-4 w-4" fill={$likeState ? "currentColor" : "none"} />
            <span class="text-sm">{$likeCount}</span>
        </button>
        <button class="flex items-center gap-2 hover:text-blue-400 transition-colors">
            <MessageCircle class="h-4 w-4" />
            <span class="text-sm">{post.comments?.length ?? 0}</span>
        </button>
        <button class="hover:text-green-400 transition-colors" on:click={handleShare}>
            <Forward class="h-4 w-4" />
        </button>
    </div>
    <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 hover:text-yellow-400 transition-colors">
            <Bookmark class="h-4 w-4" />
            <span class="text-sm">{post.saves?.length ?? 0}</span>
        </button>
        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <button class="hover:bg-foreground/10 rounded-lg p-2 transition-colors">
                    <MoreHorizontal class="h-4 w-4" />
                </button>   
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {#if $page.url.pathname !== `/p/${post.id}`}
                    <DropdownMenuItem class="gap-2" on:click={() => goto(`/p/${post.id}`)}>
                        <ExternalLink class="h-4 w-4" />
                        <p>Open Full Post</p>
                    </DropdownMenuItem>
                {/if}
                <DropdownMenuItem class="gap-2 !text-destructive" on:click={() => {
                    alert("Report Post");
                }}>
                    <Flag class="h-4 w-4" />
                    <p>Report Post</p>
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-2 !text-destructive" on:click={() => {
                    alert("Block User");
                }}>
                    <Ban class="h-4 w-4" />
                    <p>Block User</p>
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-2" on:click={() => {
                    alert("Ignore User");
                }}>
                    <BellOff class="h-4 w-4" />
                    <p>Ignore User</p>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</div>