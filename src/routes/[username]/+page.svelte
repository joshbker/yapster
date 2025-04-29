<script>
    import { page } from "$app/stores"
    import { Button } from '$lib/component/ui/button';
    import { 
        Settings,
        MessageSquare,
        UserPlus,
        Pencil,
        Ellipsis,
        Flag,
        Ban,
        BellOff
    } from "lucide-svelte"
    import BadgeVerified from "$lib/component/BadgeVerified.svelte"
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public"
    import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "$lib/component/ui/dropdown-menu"
    import { Dialog, DialogContent } from "$lib/component/ui/dialog"
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/component/ui/tabs"

    $: user = $page.data.displayedUser
    let showDialog = false;
    let activeTab = "following";

    $: followingPromise = $page.data.streamed?.following;
    $: followersPromise = $page.data.streamed?.followers;
</script>

<div class="relative lg:container lg:max-w-5xl lg:px-6 lg:py-6">
    {#if user.banner}
        <img src={user.banner} alt="Banner" class="w-full h-32 lg:h-48 object-cover lg:rounded-xl">
    {:else}
        <div class="w-full h-32 lg:h-48 lg:rounded-xl bg-gradient-to-br from-purple-500 to-blue-400"></div>
    {/if}
    <img src={user.image ?? PUBLIC_DEFAULT_AVATAR_URL} alt="Avatar" class="absolute left-3 lg:left-14 -bottom-8 lg:-bottom-2 w-24 h-24 rounded-full object-cover border-4 border-background">
</div>
<div class="container max-w-4xl px-4 lg:px-0 py-2 mt-6 lg:mt-0">
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
            <div class="flex items-center gap-1.5">
                <h1 class="text-lg font-bold">{user.name ?? user.username}</h1>
                {#if user.verified}
                    <BadgeVerified />
                {/if}
            </div>
            {#if user.name}
                <p class="text-sm font-medium text-muted-foreground">{user.username}</p>
            {/if}
        </div>

        <div class="flex gap-2">
            {#if user.username === $page.data.locals.user.username}
                <Button variant="outline" class="px-2 h-8 flex items-center gap-1.5" href="/account/profile">
                    <Pencil class="h-4 w-4" />
                    <p class="hidden lg:block">Edit Profile</p>
                </Button>
                <Button variant="outline" class="px-2 h-8 flex items-center gap-1.5" href="/account/settings">
                    <Settings class="h-4 w-4" />
                    <p class="hidden lg:block">Settings</p>
                </Button>
            {:else}
                <Button class="px-2 h-8 flex items-center gap-1.5">
                    <UserPlus class="h-4 w-4" />
                    <p class="hidden lg:block">Follow</p>
                </Button>
                <Button variant="outline" class="px-2 h-8 flex items-center gap-1.5">
                    <MessageSquare class="h-4 w-4" />
                    <p class="hidden lg:block">Message</p>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button variant="outline" class="px-2 h-8">
                            <Ellipsis class="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem class="gap-2 !text-destructive">
                            <Flag class="h-4 w-4" />
                            <p>Report</p>
                        </DropdownMenuItem>
                        <DropdownMenuItem class="gap-2 !text-destructive">
                            <Ban class="h-4 w-4" />
                            <p>Block</p>
                        </DropdownMenuItem>
                        <DropdownMenuItem class="gap-2">
                            <BellOff class="h-4 w-4" />
                            <p>Ignore</p>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            {/if}
        </div>
    </div>

    <div class="mt-2">
        <p class="text-sm">{user.bio ?? "No bio yet."}</p>
    </div>

    <div class="mt-4 flex gap-6">
        <button 
            class="text-sm text-muted-foreground hover:underline"
            on:click={() => {
                activeTab = "following";
                showDialog = true;
            }}
        >
            <span class="font-semibold">{user.following?.length ?? 0}</span> following
        </button>
        <button 
            class="text-sm text-muted-foreground hover:underline"
            on:click={() => {
                activeTab = "followers";
                showDialog = true;
            }}
        >
            <span class="font-semibold">{user.followers?.length ?? 0}</span> followers
        </button>
        <p class="text-sm text-muted-foreground"><span class="font-semibold">{user.posts?.length ?? 0}</span> posts</p>
    </div>
</div>

<Dialog bind:open={showDialog}>
    <DialogContent class="w-[calc(100%-2rem)] sm:w-[28rem] h-[calc(100vh-8rem)] max-h-[46rem] my-4 rounded-xl flex flex-col p-2 [&>button]:hidden">
        <Tabs bind:value={activeTab} class="flex-1 flex flex-col">
            <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="followers">Followers</TabsTrigger>
            </TabsList>
            <TabsContent value="following" class="flex-1 overflow-y-auto">
                {#await followingPromise}
                    <div class="h-full flex items-center justify-center">
                        <p class="text-sm text-muted-foreground">Loading...</p>
                    </div>
                {:then followingUsers}
                    {#if !followingUsers?.length}
                        <div class="h-full flex items-center justify-center">
                            <p class="text-sm text-muted-foreground">No following users</p>
                        </div>
                    {:else}
                        <div class="space-y-2 p-1">
                            {#each followingUsers as followingUser}
                                <a 
                                    href="/{followingUser.username}" 
                                    class="flex items-center gap-3 p-2 hover:bg-muted rounded-lg"
                                    on:click={() => showDialog = false}
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
                                            <p class="text-sm text-muted-foreground">@{followingUser.username}</p>
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
                            <p class="text-sm text-muted-foreground">No followers</p>
                        </div>
                    {:else}
                        <div class="space-y-2 p-1">
                            {#each followerUsers as followerUser}
                                <a 
                                    href="/{followerUser.username}" 
                                    class="flex items-center gap-3 p-2 hover:bg-muted rounded-lg"
                                    on:click={() => showDialog = false}
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
                                            <p class="text-sm text-muted-foreground">@{followerUser.username}</p>
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
