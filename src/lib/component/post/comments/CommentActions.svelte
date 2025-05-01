<script>
    import { Heart, MoreHorizontal, Flag, Ban, BellOff, Pencil, Trash } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "$lib/component/ui/dropdown-menu"
    import { goto } from "$app/navigation";
    import { writable } from 'svelte/store';
    import * as Drawer from "$lib/component/ui/drawer";
    import { getUserById } from "$lib/util";
    import ProfileCardSlim from "$lib/component/profile/ProfileCardSlim.svelte";
    import { Loader2 } from "lucide-svelte";

    export let comment;
    export let viewer;

    const likeState = writable(false);
    const likeCount = writable(0);
    let isLiking = false;
    let likeDebounceTimeout;
    let drawerOpen = false;

    // Store for users who liked
    const likeUsers = writable([]);
    const isLoadingLikes = writable(false);

    // Make isLiked and likeCount fully reactive using the stores
    $: $likeState = comment.likes?.includes(viewer?.id) ?? false;
    $: $likeCount = comment.likes?.length ?? 0;

    // Load users who liked when drawer opens
    $: if (drawerOpen && comment.likes && (!$likeUsers.length || $likeUsers.length !== comment.likes.length)) {
        loadLikeUsers();
    }

    async function loadLikeUsers() {
        if ($isLoadingLikes) return;
        
        $isLoadingLikes = true;
        try {
            const users = await Promise.all(comment.likes.map(id => getUserById(id)));
            $likeUsers = users.filter(Boolean);
        } catch (err) {
            console.error('Failed to load users who liked:', err);
            toast.error("Failed to load users");
        } finally {
            $isLoadingLikes = false;
        }
    }

    // Debounced like function
    function debouncedLike() {
        if (likeDebounceTimeout) {
            clearTimeout(likeDebounceTimeout);
        }

        likeDebounceTimeout = setTimeout(handleLike, 300);
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
    <div class="flex items-center">
        <button 
            class="transition-colors p-1 {$likeState ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}" 
            on:click={debouncedLike}
            disabled={isLiking}
        >
            <Heart class="h-3.5 w-3.5" fill={$likeState ? "currentColor" : "none"} />
        </button>
        <Drawer.Root bind:open={drawerOpen}>
            <Drawer.Trigger>
                <button 
                    class="text-xs hover:underline px-1 {$likeState ? 'text-red-500 hover:text-red-600' : ''}"
                >
                    {$likeCount}
                </button>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Content>
                    <div class="mx-auto w-full max-w-sm">
                        <Drawer.Header>
                            <Drawer.Title class="text-base font-semibold text-center">Likes</Drawer.Title>
                        </Drawer.Header>
                        <div class="px-4 h-[70vh] overflow-y-auto">
                            {#if $isLoadingLikes}
                                <div class="py-4 flex justify-center">
                                    <Loader2 class="h-6 w-6 animate-spin" />
                                </div>
                            {:else if $likeUsers.length > 0}
                                <div class="space-y-2 pb-4">
                                    {#each $likeUsers as user}
                                        <button 
                                            class="w-full"
                                            on:click={() => {
                                                drawerOpen = false;
                                                goto(`/@${user.username}`);
                                            }}
                                        >
                                            <ProfileCardSlim {user} viewer={viewer} />
                                        </button>
                                    {/each}
                                </div>
                            {:else}
                                <p class="text-center text-muted-foreground text-sm">No likes yet</p>
                            {/if}
                        </div>
                        <Drawer.Footer class="mb-12"></Drawer.Footer>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
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