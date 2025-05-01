<script>
    import { Heart, MessageCircle, Forward, Bookmark, MoreHorizontal, Flag, Ban, BellOff, ExternalLink, Pencil, Trash } from "lucide-svelte";
    import { PUBLIC_BASE_URL } from "$env/static/public";
    import { toast } from "svelte-sonner";
    import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "$lib/component/ui/dropdown-menu"
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { writable } from 'svelte/store';
    import * as Drawer from "$lib/component/ui/drawer";
    import { getUserById } from "$lib/util";
    import ProfileCardSlim from "$lib/component/profile/ProfileCardSlim.svelte";
    import { Loader2 } from "lucide-svelte";

    export let post;
    export let viewer;

    const likeState = writable(false);
    const likeCount = writable(0);
    let isLikeLoading = false;
    let likeDebounceTimeout;
    let drawerOpen = false;

    // Store for users who liked
    const likeUsers = writable([]);
    const isLoadingLikes = writable(false);

    // Make isLiked and likeCount fully reactive using the stores
    $: $likeState = post.likes?.includes(viewer?.id) ?? false;
    $: $likeCount = post.likes?.length ?? 0;

    // Load users who liked when drawer opens
    $: if (drawerOpen && post.likes && (!$likeUsers.length || $likeUsers.length !== post.likes.length)) {
        loadLikeUsers();
    }

    async function loadLikeUsers() {
        if ($isLoadingLikes) return;
        
        $isLoadingLikes = true;
        try {
            const users = await Promise.all(post.likes.map(id => getUserById(id)));
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

    async function handleComment() {
        alert("Comment")
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
    
    async function handleDeletePost() {
        alert("Delete Post");
    }
</script>

<div class="flex w-full justify-between">
    <div class="flex items-center gap-3">
        <div class="flex items-center">
            <button 
                class="transition-colors p-2 {$likeState ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}" 
                on:click={debouncedLike}
                disabled={isLikeLoading}
            >
                <Heart class="h-4 w-4" fill={$likeState ? "currentColor" : "none"} />
            </button>
            <Drawer.Root bind:open={drawerOpen}>
                <Drawer.Trigger>
                    <button 
                        class="text-sm hover:underline px-1 {$likeState ? 'text-red-500 hover:text-red-600' : ''}"
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
    <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 hover:text-yellow-400 transition-colors">
            <Bookmark class="h-4 w-4" />
            <span class="text-sm">{post.saves?.length ?? 0}</span>
        </button>
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
                {#if viewer.id !== post.author.id}
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
                {:else}
                    <DropdownMenuItem class="gap-2" on:click={handleEditPost}>
                        <Pencil class="h-4 w-4" />
                        <p>Edit Post</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-2 !text-destructive" on:click={handleDeletePost}>
                        <Trash class="h-4 w-4" />
                        <p>Delete Post</p>
                    </DropdownMenuItem>
                {/if}
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</div>