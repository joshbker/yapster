<script>
    import { Dialog, DialogContent } from "$lib/component/ui/dialog"
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/component/ui/tabs"
    import { Loader2 } from "lucide-svelte"
    import ProfileCardSlim from "$lib/component/ProfileCardSlim.svelte"
    import HeaderNavigation from "$lib/component/HeaderNavigation.svelte"
    export let open = false;
    export let followingUsers = [];
    export let followerUsers = [];
    export let followingCount = 0;
    export let followersCount = 0;
    export let loadMoreFollowing;
    export let loadMoreFollowers;
    export let isLoadingMore = false;
    export let onClose = () => {};
    export let initialTab = "following";
    export let viewer;
    let followersContainer;
    let followingContainer;

    // Reset to initial tab when dialog opens and load initial data if needed
    $: if (open) {
        if (initialTab === "following" && followingUsers.length === 0) {
            loadMoreFollowing();
        } else if (initialTab === "followers" && followerUsers.length === 0) {
            loadMoreFollowers();
        }
    }

    // Handle tab changes
    function handleTabChange(tab) {
        if (tab === "following" && followingUsers.length === 0) {
            loadMoreFollowing();
        } else if (tab === "followers" && followerUsers.length === 0) {
            loadMoreFollowers();
        }
    }

    // Handle infinite scroll
    function handleScroll(e, isFollowing = true) {
        const container = e.target;
        const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        
        if (scrollBottom < 100 && !isLoadingMore) {
            if (isFollowing) {
                if (followingUsers.length < followingCount) {
                    loadMoreFollowing();
                }
            } else {
                if (followerUsers.length < followersCount) {
                    loadMoreFollowers();
                }
            }
        }
    }
</script>

<Dialog bind:open on:close={onClose}>
    <DialogContent class="h-screen lg:max-h-[46rem] min-w-[calc(100%-2rem)] lg:min-w-[50rem] lg:rounded-xl flex flex-col p-0 gap-0 [&>button]:hidden">
        <div class="m-0 p-0">
            <HeaderNavigation back={() => {
                onClose();
                open = false;
            }} />
        </div>
        <Tabs value={initialTab} onValueChange={handleTabChange} class="flex-1 flex flex-col px-2">
            <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="following" class="flex items-center gap-2">
                    <p>Following</p>
                    <p class="text-sm text-muted-foreground">({followingCount})</p>
                </TabsTrigger>
                <TabsTrigger value="followers" class="flex items-center gap-2">
                    <p>Followers</p>
                    <p class="text-sm text-muted-foreground">({followersCount})</p>
                </TabsTrigger>
            </TabsList>
            <TabsContent 
                value="following" 
                class="flex-1 overflow-y-auto"
                bind:this={followingContainer}
                on:scroll={(e) => handleScroll(e, true)}
            >
                {#if !followingUsers?.length && !isLoadingMore}
                    <div class="h-full flex items-center justify-center">
                        <p class="text-sm text-muted-foreground">Not following anyone yet</p>
                    </div>
                {:else}
                    <div class="space-y-2 p-1">
                        {#each followingUsers as user}
                            <button 
                                class="w-full"
                                on:click={() => {
                                    onClose();
                                    open = false;
                                }}
                            >
                                <ProfileCardSlim {user} {viewer} />
                            </button>
                        {/each}
                        
                        {#if isLoadingMore}
                            <div class="py-4 flex justify-center">
                                <Loader2 class="h-6 w-6 animate-spin" />
                            </div>
                        {/if}
                    </div>
                {/if}
            </TabsContent>
            <TabsContent 
                value="followers" 
                class="flex-1 overflow-y-auto"
                bind:this={followersContainer}
                on:scroll={(e) => handleScroll(e, false)}
            >
                {#if !followerUsers?.length && !isLoadingMore}
                    <div class="h-full flex items-center justify-center">
                        <p class="text-sm text-muted-foreground">No followers yet</p>
                    </div>
                {:else}
                    <div class="space-y-2 p-1">
                        {#each followerUsers as user}
                            <button 
                                class="w-full"
                                on:click={() => {
                                    onClose();
                                    open = false;
                                }}
                            >
                                <ProfileCardSlim {user} {viewer} />
                            </button>
                        {/each}
                        
                        {#if isLoadingMore}
                            <div class="py-4 flex justify-center">
                                <Loader2 class="h-6 w-6 animate-spin" />
                            </div>
                        {/if}
                    </div>
                {/if}
            </TabsContent>
        </Tabs>
    </DialogContent>
</Dialog>
