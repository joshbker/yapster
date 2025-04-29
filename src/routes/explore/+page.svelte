<script>
    import { onMount } from 'svelte';
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public";
    import BadgeVerified from "$lib/component/BadgeVerified.svelte";
    import { Button } from '$lib/component/ui/button';
    import { UserPlus, MessageSquare, Ellipsis, Flag, Ban, BellOff } from "lucide-svelte";
    import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "$lib/component/ui/dropdown-menu";

    let users = [];
    let loading = true;
    let error = null;

    onMount(async () => {
        try {
            const response = await fetch('/api/user/discover');
            if (!response.ok) throw new Error('Failed to fetch users');
            users = await response.json();
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    });
</script>

<div class="container max-w-7xl px-4 py-4">
    <h1 class="text-xl font-bold mb-4">Explore</h1>

    {#if loading}
        <div class="text-center py-12">
            <p class="text-muted-foreground">Loading users...</p>
        </div>
    {:else if error}
        <div class="text-center py-12">
            <p class="text-destructive">Error: {error}</p>
        </div>
    {:else if users.length === 0}
        <div class="text-center py-12">
            <p class="text-muted-foreground">No users found</p>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each users as user}
                <div class="border rounded-lg flex flex-col">
                    <div class="relative">
                        {#if user.banner}
                            <img src={user.banner} alt="Banner" class="w-full h-24 object-cover rounded-t-lg">
                        {:else}
                            <div class="w-full h-24 bg-gradient-to-br from-purple-500 to-blue-400 rounded-t-lg"></div>
                        {/if}
                        <img 
                            src={user.image ?? PUBLIC_DEFAULT_AVATAR_URL} 
                            alt={user.username}
                            class="absolute left-4 -bottom-6 w-16 h-16 rounded-full object-cover border-[3px] border-background"
                        >
                    </div>
                    
                    <div class="p-6 pt-6 flex flex-col">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2.5">
                                <div class="flex items-center gap-1.5">
                                    <h2 class="font-semibold">{user.name ?? user.username}</h2>
                                    {#if user.verified}
                                        <BadgeVerified />
                                    {/if}
                                </div>
                                {#if user.name}
                                    <p class="text-sm font-medium text-muted-foreground">{user.username}</p>
                                {/if}
                            </div>
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
                        </div>

                        <p class="text-sm">{user.bio ?? "No bio yet."}</p>

                        <div class="flex gap-6 mt-3">
                            <p class="text-sm text-muted-foreground">
                                <span class="font-semibold">{user.following?.length ?? 0}</span> following
                            </p>
                            <p class="text-sm text-muted-foreground">
                                <span class="font-semibold">{user.followers?.length ?? 0}</span> followers
                            </p>
                            <p class="text-sm text-muted-foreground">
                                <span class="font-semibold">{user.posts?.length ?? 0}</span> posts
                            </p>
                        </div>

                        <div class="flex gap-2 mt-3">
                            <Button class="flex-1 h-8 flex items-center justify-center gap-1.5">
                                <UserPlus class="h-4 w-4" />
                                <span>Follow</span>
                            </Button>
                            <Button variant="outline" class="flex-1 h-8 flex items-center justify-center gap-1.5">
                                <MessageSquare class="h-4 w-4" />
                                <span>Message</span>
                            </Button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>