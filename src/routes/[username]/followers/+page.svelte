<script>
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/component/ui/tabs"
    import { Loader2 } from "lucide-svelte"
    import ProfileCardSlim from "$lib/component/profile/ProfileCardSlim.svelte"
    import HeaderNavigation from "$lib/component/HeaderNavigation.svelte"
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';
    import { getUserById, getUserByUsername } from "$lib/util";
    import { onMount } from 'svelte';

    const PAGE_SIZE = 20;
    
    // Stores for data management
    const followerUsers = writable([]);
    const followersCount = writable(0);
    const isLoadingMore = writable(false);
    
    let followersContainer;
    $: user = $page.data.user;

    // Initialize data when component mounts
    onMount(async () => {
        // Initialize counts
        $followersCount = user.followers?.length ?? 0;
        loadMoreFollowers();
    });

    async function loadMoreFollowers() {
        if ($isLoadingMore || !user) return;
        
        $isLoadingMore = true;
        try {
            const skip = $followerUsers.length;
            const userIds = user.followers?.slice(skip, skip + PAGE_SIZE) ?? [];
            
            if (userIds.length === 0) return;
            
            const users = await Promise.all(userIds.map(id => getUserById(id)));
            $followerUsers = [...$followerUsers, ...users.filter(Boolean)];
        } catch (err) {
            console.error('Failed to load more followers:', err);
        } finally {
            $isLoadingMore = false;
        }
    }

    // Handle infinite scroll
    function handleScroll(e) {
        const container = e.target;
        const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        
        if (scrollBottom < 100 && !$isLoadingMore) {
            if ($followerUsers.length < $followersCount) {
                loadMoreFollowers();
            }
        }
    }

    function handleBack() {
        history.back();
    }

    function handleTabChange(value) {
        if (value === "following") {
            goto(`/@${$page.params.username}/following`, { replaceState: true });
        }
    }
</script>

<div class="h-full w-full flex flex-col">
    <div class="m-0 p-0">
        <HeaderNavigation back={handleBack} />
    </div>
    <div class="flex-1 flex flex-col px-2 max-w-xl self-center w-full">
        <div class="w-full">
            <Tabs value="followers" onValueChange={handleTabChange} class="w-full">
                <TabsList class="grid w-full grid-cols-2">
                    <TabsTrigger value="following" class="flex items-center gap-2 flex-1">
                        <p>Following</p>
                        <p class="text-sm text-muted-foreground">({user.following?.length ?? 0})</p>
                    </TabsTrigger>
                    <TabsTrigger value="followers" class="flex items-center gap-2 flex-1">
                        <p>Followers</p>
                        <p class="text-sm text-muted-foreground">({$followersCount})</p>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        <div 
            class="flex-1 overflow-y-auto"
            bind:this={followersContainer}
            on:scroll={handleScroll}
        >
            {#if !$followerUsers?.length && !$isLoadingMore}
                <div class="h-full flex items-center justify-center">
                    <p class="text-sm text-muted-foreground">No followers yet</p>
                </div>
            {:else}
                <div class="space-y-2 p-1">
                    {#each $followerUsers as follower}
                        <button 
                            class="w-full"
                            on:click={() => {
                                goto(`/${follower.username}`);
                            }}
                        >
                            <ProfileCardSlim user={follower} viewer={$page.data.user} />
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
