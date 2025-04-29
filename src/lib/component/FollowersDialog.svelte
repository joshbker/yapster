<script>
    import { Dialog, DialogContent } from "$lib/component/ui/dialog"
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/component/ui/tabs"
    import BadgeVerified from "$lib/component/BadgeVerified.svelte"
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public"

    export let open = false;
    export let followingPromise;
    export let followersPromise;
    export let followingCount;
    export let followersCount;
    export let onClose = () => {};
    export let initialTab = "following";

    let activeTab = initialTab;

    // Reset to initial tab when dialog opens
    $: if (open) {
        activeTab = initialTab;
    }
</script>

<Dialog bind:open on:close={onClose}>
    <DialogContent class="w-[calc(100%-2rem)] sm:w-[28rem] h-[calc(100vh-8rem)] max-h-[46rem] my-4 rounded-xl flex flex-col p-2 [&>button]:hidden">
        <Tabs bind:value={activeTab} class="flex-1 flex flex-col">
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
            <TabsContent value="following" class="flex-1 overflow-y-auto">
                {#await followingPromise}
                    <div class="h-full flex items-center justify-center">
                        <p class="text-sm text-muted-foreground">Loading...</p>
                    </div>
                {:then followingUsers}
                    {#if !followingUsers?.length}
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
                                >
                                    <img src={followingUser.image ?? PUBLIC_DEFAULT_AVATAR_URL} alt="Avatar" class="w-10 h-10 rounded-full">
                                    <div>
                                        <div class="flex items-center gap-1">
                                            <p class="font-medium">{followingUser.name ?? followingUser.username}</p>
                                            {#if followingUser.verified}
                                                <BadgeVerified class="h-4 w-4" />
                                            {/if}
                                        </div>
                                        {#if followingUser.name}
                                            <p class="text-sm text-muted-foreground">{followingUser.username}</p>
                                        {/if}
                                    </div>
                                </a>
                            {/each}
                        </div>
                    {/if}
                {/await}
            </TabsContent>
            <TabsContent value="followers" class="flex-1 overflow-y-auto">
                {#await followersPromise}
                    <div class="h-full flex items-center justify-center">
                        <p class="text-sm text-muted-foreground">Loading...</p>
                    </div>
                {:then followerUsers}
                    {#if !followerUsers?.length}
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
                                                <BadgeVerified size={16} />
                                            {/if}
                                        </div>
                                        {#if followerUser.name}
                                            <p class="text-sm text-muted-foreground">{followerUser.username}</p>
                                        {/if}
                                    </div>
                                </a>
                            {/each}
                        </div>
                    {/if}
                {/await}
            </TabsContent>
        </Tabs>
    </DialogContent>
</Dialog>
