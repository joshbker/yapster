<script>
    import { Heart, MessageCircle, Forward, Bookmark, MoreHorizontal, Flag, Ban, BellOff, ExternalLink, Pencil, Trash } from "lucide-svelte";
    import { PUBLIC_BASE_URL } from "$env/static/public";
    import { toast } from "svelte-sonner";
    import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "$lib/component/ui/dropdown-menu"
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { writable } from 'svelte/store';
    import LikesDrawer from "./LikesDrawer.svelte";
    import SavesDrawer from "./SavesDrawer.svelte";
    import { triggerLikeUpdate } from "$lib/data/likeStore";
    import { triggerSaveUpdate } from "$lib/data/saveStore";
    import { triggerPostDelete } from "$lib/data/deleteStore";

    export let post;
    export let author;
    export let viewer;

    const likeState = writable(false);
    const likeCount = writable(0);
    const saveState = writable(false);
    const saveCount = writable(0);
    let isLikeLoading = false;
    let isSaveLoading = false;
    let likesDrawerOpen = false;
    let savesDrawerOpen = false;

    // Initialize the stores once
    $: {
        if (post?.likes) {
            $likeState = post.likes.includes(viewer?.id) ?? false;
            $likeCount = post.likes.length;
        }
        if (post?.saves) {
            $saveState = post.saves.includes(viewer?.id) ?? false;
            $saveCount = post.saves.length;
        }
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

            // Trigger like update
            triggerLikeUpdate(post.id);
        } catch (err) {
            console.error('Failed to like/unlike:', err);
            toast.error(err.message);
        } finally {
            isLikeLoading = false;
        }
    }

    async function handleSave() {
        if (isSaveLoading) return;

        const wasSaved = $saveState;
        const previousCount = $saveCount;
        
        // Optimistic updates
        $saveState = !wasSaved;
        $saveCount = wasSaved ? previousCount - 1 : previousCount + 1;
        isSaveLoading = true;

        try {
            const response = await fetch(`/api/me/post/${post.id}/save`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Revert on failure
                $saveState = wasSaved;
                $saveCount = previousCount;
                const data = await response.json();
                throw new Error(data.message || 'Failed to save post');
            }

            // Update the arrays based on the action
            if (wasSaved) {
                // Unsave: Remove user ID from saves array
                post.saves = post.saves.filter(id => id !== viewer.id);
            } else {
                // Save: Add user ID to saves array
                post.saves = [...(post.saves || []), viewer.id];
            }

            // Trigger save update
            triggerSaveUpdate(post.id);
        } catch (err) {
            console.error('Failed to save/unsave:', err);
            toast.error(err.message);
        } finally {
            isSaveLoading = false;
        }
    }

    async function handleShare() {
        await navigator.clipboard.writeText(`${PUBLIC_BASE_URL}/p/${post.id}`);
        toast.success("Link copied to clipboard!");
    }

    async function handleReportPost() {
        alert("Report Post");
    }

    async function handleBlockUser() {
        alert("Block User");
    }
    
    async function handleIgnoreUser() {
        alert("Ignore User");
    }

    async function handleEditPost() {
        alert("Edit Post");
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`/api/post/${post.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete post');
            }

            // Show success message
            toast.success("Post deleted successfully");

            // Trigger post deletion update
            triggerPostDelete(post.id);

            // Redirect to profile page if we're on the post's page
            if ($page.url.pathname === `/p/${post.id}`) {
                goto(`/u/${author.username}`);
            }
        } catch (err) {
            console.error('Failed to delete post:', err);
            toast.error("Failed to delete post");
        }
    }
</script>

<div class="flex w-full justify-between">
    <div class="flex items-center gap-3">
        <div class="flex items-center">
            <button 
                class="transition-colors p-2 {$likeState ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}" 
                on:click={like}
                disabled={isLikeLoading}
            >
                <Heart class="h-4 w-4" fill={$likeState ? "currentColor" : "none"} />
            </button>
            <LikesDrawer 
                bind:open={likesDrawerOpen}
                likes={post.likes}
                {viewer}
                likeState={$likeState}
                id={post.id}
                likeCount={$likeCount}
            />
        </div>
        <a 
            class="flex items-center gap-2 hover:text-blue-400 transition-colors"
            href={`/p/${post.id}`}
        >
            <MessageCircle class="h-4 w-4" />
            <span class="text-sm">{post.comments?.length ?? 0}</span>
        </a>
        <button class="hover:text-green-400 transition-colors" on:click={handleShare}>
            <Forward class="h-4 w-4" />
        </button>
    </div>
    <div class="flex items-center">
        <div class="flex items-center">
            {#if viewer.id !== author.id}
                <button 
                    class="flex items-center gap-2 transition-colors mr-2 {$saveState ? 'text-yellow-400 hover:text-yellow-500' : 'hover:text-yellow-400'}" 
                    on:click={handleSave}
                    disabled={isSaveLoading}
                >
                    <Bookmark class="h-4 w-4" fill={$saveState ? "currentColor" : "none"} />
                    <span class="text-sm">{$saveCount}</span>
                </button>
            {:else}
                <button 
                    class="flex items-center gap-2 transition-colors {$saveState ? 'text-yellow-400 hover:text-yellow-500' : 'hover:text-yellow-400'}" 
                    on:click={handleSave}
                    disabled={isSaveLoading}
                >
                    <Bookmark class="h-4 w-4" fill={$saveState ? "currentColor" : "none"} />
                </button>
                <SavesDrawer 
                    bind:open={savesDrawerOpen}
                    saves={post.saves}
                    {viewer}
                    saveState={$saveState}
                    id={post.id}
                    saveCount={$saveCount}
                />
            {/if}
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger>
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
                {#if viewer.id === author.id}
                    <DropdownMenuItem class="gap-2" on:click={handleEditPost}>
                        <Pencil class="h-4 w-4" />
                        <p>Edit Post</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-2 !text-destructive" on:click={handleDelete}>
                        <Trash class="h-4 w-4" />
                        <p>Delete Post</p>
                    </DropdownMenuItem>
                {:else}
                    <DropdownMenuItem class="gap-2 !text-destructive" on:click={handleReportPost}>
                        <Flag class="h-4 w-4" />
                        <p>Report Post</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-2 !text-destructive" on:click={handleBlockUser}>
                        <Ban class="h-4 w-4" />
                        <p>Block User</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-2" on:click={handleIgnoreUser}>
                        <BellOff class="h-4 w-4" />
                        <p>Ignore User</p>
                    </DropdownMenuItem>
                {/if}
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</div>