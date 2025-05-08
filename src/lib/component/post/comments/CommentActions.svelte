<script>
    import { Heart, MoreHorizontal, Flag, Ban, BellOff, Pencil, Trash, Reply } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "$lib/component/ui/dropdown-menu"
    import { writable } from 'svelte/store';
    import LikesDrawer from "$lib/component/post/LikesDrawer.svelte";
    import { getUserById } from "$lib/util";
    import { triggerLikeUpdate } from "$lib/data/likeStore";

    export let comment;
    export let viewer;
    export let onReply;

    const likeState = writable(false);
    const likeCount = writable(0);
    let isLiking = false;
    let drawerOpen = false;

    // Store for users who liked
    const likeUsers = writable([]);
    const isLoadingLikes = writable(false);

    // Initialize the stores once
    $: {
        if (comment?.likes) {
            $likeState = comment.likes.includes(viewer?.id) ?? false;
            $likeCount = comment.likes.length;
        }
    }

    // Load users who liked when drawer opens
    $: if (drawerOpen && !$isLoadingLikes && comment?.likes?.length > 0 && $likeUsers.length === 0) {
        loadLikeUsers();
    }

    async function loadLikeUsers() {
        if ($isLoadingLikes || !Array.isArray(comment?.likes)) {
            return;
        }

        if (comment.likes.length === 0) {
            $likeUsers = [];
            return;
        }

        $isLoadingLikes = true;
        try {
            // Load users in batches of 5 to prevent overwhelming the server
            const batchSize = 5;
            const batches = [];
            
            for (let i = 0; i < comment.likes.length; i += batchSize) {
                const batch = comment.likes.slice(i, i + batchSize);
                const users = await Promise.all(batch.map(id => getUserById(id)));
                batches.push(...users);
                
                // Update the store with each batch
                $likeUsers = batches.filter(Boolean);
            }
        } catch (err) {
            console.error('Failed to load users who liked:', err);
            toast.error("Failed to load users");
            $likeUsers = [];
        } finally {
            $isLoadingLikes = false;
        }
    }

    async function handleLike() {
        if (!viewer) {
            toast.error("Please sign in to like comments");
            return;
        }
        if (isLiking) return;

        const wasLiked = $likeState;
        const previousCount = $likeCount;

        // Optimistic updates
        $likeState = !wasLiked;
        $likeCount = wasLiked ? previousCount - 1 : previousCount + 1;
        isLiking = true;

        try {
            const response = await fetch(`/api/post/${comment.post}/comments/${comment.id}/like`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Revert on failure
                $likeState = wasLiked;
                $likeCount = previousCount;
                throw new Error('Failed to like comment');
            }

            // Update the arrays based on the action
            if (wasLiked) {
                // Unlike: Remove user ID from likes array
                comment.likes = comment.likes.filter(id => id !== viewer.id);
            } else {
                // Like: Add user ID to likes array
                comment.likes = [...(comment.likes || []), viewer.id];
            }

            // Trigger like update
            triggerLikeUpdate(comment.id);
        } catch (err) {
            console.error('Failed to like/unlike comment:', err);
            toast.error("Failed to like comment");
        } finally {
            isLiking = false;
        }
    }

    async function handleReportComment() {
        alert("Report Comment");
    }

    async function handleBlockUser() {
        alert("Block User");
    }
    
    async function handleIgnoreUser() {
        alert("Ignore User");
    }

    async function handleEditComment() {
        alert("Edit Comment");
    }
    
    async function handleDeleteComment() {
        alert("Delete Comment");
    }
</script>

<div class="flex items-center justify-between w-full">
    <div class="flex items-center gap-2">
        <button 
            class="transition-colors p-1 {$likeState ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}" 
            on:click={handleLike}
            disabled={isLiking}
        >
            <Heart class="h-3.5 w-3.5" fill={$likeState ? "currentColor" : "none"} />
        </button>
        <LikesDrawer 
            bind:open={drawerOpen}
            likes={comment.likes}
            {viewer}
            likeState={$likeState}
            size="xs"
            id={comment.id}
            likeCount={$likeCount}
        />
        {#if viewer}
            <button 
                class="transition-colors p-1 hover:text-primary" 
                on:click={onReply}
            >
                <Reply class="h-3.5 w-3.5" />
            </button>
        {/if}
    </div>
    <DropdownMenu>
        <DropdownMenuTrigger>
            <button class="hover:bg-foreground/10 rounded-lg p-1.5 transition-colors -mr-1">
                <MoreHorizontal class="h-3.5 w-3.5" />
            </button>   
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            {#if viewer?.id !== comment.author}
                <DropdownMenuItem class="gap-2 !text-destructive" on:click={handleReportComment}>
                    <Flag class="h-4 w-4" />
                    <p>Report Comment</p>
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-2 !text-destructive" on:click={handleBlockUser}>
                    <Ban class="h-4 w-4" />
                    <p>Block User</p>
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-2" on:click={handleIgnoreUser}>
                    <BellOff class="h-4 w-4" />
                    <p>Ignore User</p>
                </DropdownMenuItem>
            {:else}
                <DropdownMenuItem class="gap-2" on:click={handleEditComment}>
                    <Pencil class="h-4 w-4" />
                    <p>Edit Comment</p>
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-2 !text-destructive" on:click={handleDeleteComment}>
                    <Trash class="h-4 w-4" />
                    <p>Delete Comment</p>
                </DropdownMenuItem>
            {/if}
        </DropdownMenuContent>
    </DropdownMenu>
</div> 