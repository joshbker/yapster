<script>
    import { Tabs, TabsList, TabsTrigger } from "$lib/component/ui/tabs"
    import { Loader2 } from "lucide-svelte"
    import ProfileCardSlim from "$lib/component/profile/ProfileCardSlim.svelte"
    import HeaderNavigation from "$lib/component/HeaderNavigation.svelte"
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';
    import { getUserById } from "$lib/util";
    import { onMount } from 'svelte';

    const user = $page.data.displayedUser;

    const PAGE_SIZE = 20;
    
    // Stores for data management
    const followingUsers = writable([]);
    const followingCount = writable(0);
    const isLoadingMore = writable(false);
    
    let followingContainer;
    
    // Initialize data when component mounts
    onMount(async () => {
        // Initialize counts
        $followingCount = user.following?.length ?? 0;
        loadMoreFollowing();
    });

    // Functions to load more data
    async function loadMoreFollowing() {
        if ($isLoadingMore || !user) return;
        
        $isLoadingMore = true;
        try {
            const skip = $followingUsers.length;
            const userIds = user.following?.slice(skip, skip + PAGE_SIZE) ?? [];
            
            if (userIds.length === 0) return;
            
            const users = await Promise.all(userIds.map(id => getUserById(id)));
            $followingUsers = [...$followingUsers, ...users.filter(Boolean)];
        } catch (err) {
            console.error('Failed to load more following:', err);
        } finally {
            $isLoadingMore = false;
        }
    }

    // Handle infinite scroll
    function handleScroll(e) {
        const container = e.target;
        const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        
        if (scrollBottom < 100 && !$isLoadingMore) {
            if ($followingUsers.length < $followingCount) {
                loadMoreFollowing();
            }
        }
    }

    function handleTabChange(value) {
        if (value === "followers") {
            goto(`/@${user.username}/followers`, { replaceState: true });
        }
    }
</script>

<div class="h-full w-full flex flex-col">
    <div class="m-0 p-0">
        <HeaderNavigation  name={user.name ?? user.username} />
    </div>
    <div class="flex-1 flex flex-col px-2 max-w-xl self-center w-full">
        <div class="w-full">
            <Tabs value="following" onValueChange={handleTabChange} class="w-full">
                <TabsList class="grid w-full grid-cols-2">
                    <TabsTrigger value="following" class="flex items-center gap-2 flex-1">
                        <p>Following</p>
                        <p class="text-sm text-muted-foreground">({$followingCount})</p>
                    </TabsTrigger>
                    <TabsTrigger value="followers" class="flex items-center gap-2 flex-1">
                        <p>Followers</p>
                        <p class="text-sm text-muted-foreground">({user.followers?.length ?? 0})</p>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        <div 
            class="flex-1 overflow-y-auto"
            bind:this={followingContainer}
            on:scroll={handleScroll}
        >
            {#if !$followingUsers?.length && !$isLoadingMore}
                <div class="h-full flex items-center justify-center">
                    <p class="text-sm text-muted-foreground">Not following anyone yet</p>
                </div>
            {:else}
                <div class="space-y-2 p-1">
                    {#each $followingUsers as followedUser}
                        <button 
                            class="w-full"
                            on:click={() => {
                                goto(`/${followedUser.username}`);
                            }}
                        >
                            <ProfileCardSlim user={followedUser} viewer={$page.data.user} />
                        </button>
                    {/each}
                    
                    {#if $isLoadingMore}
                        <div class="py-4 flex justify-center">
                            <Loader2 class="h-6 w-6 animate-spin" />
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>
