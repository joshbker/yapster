<script>
    import { Dialog, DialogContent } from "$lib/component/ui/dialog"
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/component/ui/tabs"
    import { Button } from "$lib/component/ui/button"
    import BadgeVerified from "$lib/component/BadgeVerified.svelte"
    import { Loader2 } from "lucide-svelte"
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public"

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
    <DialogContent class="w-[calc(100%-2rem)] sm:w-[28rem] h-[calc(100vh-8rem)] max-h-[46rem] my-4 rounded-xl flex flex-col p-2 [&>button]:hidden">
        <Tabs value={initialTab} onValueChange={handleTabChange} class="flex-1 flex flex-col">
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
                        {#each followingUsers as followingUser}
                            <a 
                                href="/{followingUser.username}" 
                                class="flex items-center gap-3 p-2 hover:bg-muted rounded-lg"
                                on:click={() => open = false}
                                data-sveltekit-preload-data="off"
                            >
                                <img src={followingUser.image ?? PUBLIC_DEFAULT_AVATAR_URL} alt="Avatar" class="w-10 h-10 rounded-full">
                                <div>
                                    <div class="flex items-center gap-1">
                                        <p class="font-medium">{followingUser.name ?? followingUser.username}</p>
                                        {#if followingUser.verified}
                                            <BadgeVerified size={16} />
                                        {/if}
                                    </div>
                                    {#if followingUser.name}
                                        <p class="text-sm text-muted-foreground">{followingUser.username}</p>
                                    {/if}
                                </div>
                            </a>
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
                        {#each followerUsers as followerUser}
                            <a 
                                href="/{followerUser.username}" 
                                class="flex items-center gap-3 p-2 hover:bg-muted rounded-lg"
                                on:click={() => open = false}
                            >
                                <img src={followerUser.image ?? PUBLIC_DEFAULT_AVATAR_URL} alt="Avatar" class="w-10 h-10 rounded-full">
                                <div>
                                    <div class="flex items-center gap-1">
                                        <p class="font-medium">{followerUser.name ?? followerUser.username}</p>
                                        {#if followerUser.verified}
                                            <BadgeVerified class="h-4 w-4" />
                                        {/if}
                                    </div>
                                    {#if followerUser.name}
                                        <p class="text-sm text-muted-foreground">{followerUser.username}</p>
                                    {/if}
                                </div>
                            </a>
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
