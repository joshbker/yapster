<script>
    import { page } from "$app/stores"
    import { Button } from '$lib/component/ui/button';
    import { 
        Settings,
        MessageSquare,
        UserPlus,
        Grid,
        BookmarkIcon,
        Heart,
        Pencil,
    } from "lucide-svelte"
    import BadgeVerified from "$lib/component/BadgeVerified.svelte"
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public"

    $: user = $page.data.displayedUser
</script>

<div class="relative lg:container lg:max-w-5xl lg:px-6 lg:py-6">
    {#if user.banner}
        <img src={user.banner} alt="Banner" class="w-full h-32 lg:h-48 object-cover lg:rounded-xl">
    {:else}
        <div class="w-full h-32 lg:h-48 lg:rounded-xl bg-gradient-to-br from-purple-500 to-blue-400"></div>
    {/if}
    <img src={user.image ?? PUBLIC_DEFAULT_AVATAR_URL} alt="Avatar" class="absolute left-3 lg:left-14 -bottom-8 w-[5.5rem] h-[5.5rem] rounded-full object-cover border-4 border-background">
</div>
<div class="container max-w-4xl px-4 lg:px-0 py-6 mt-4">
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
                <Button variant="outline" class="px-1.5 h-[1.625rem]" href="/account/profile">
                    <Pencil class="h-3 w-3" />
                </Button>
                <Button variant="outline" class="px-1.5 h-[1.625rem]" href="/account/settings">
                    <Settings class="h-3 w-3" />
                </Button>
            {:else}
                <Button variant="outline">
                    <MessageSquare class="mr-2 h-4 w-4" />
                    Message
                </Button>
                <Button>
                    <UserPlus class="mr-2 h-4 w-4" />
                    Follow
                </Button>
            {/if}
        </div>
    </div>

    <!-- Profile Stats -->
    <div class="mt-6 flex gap-6 border-y py-4">
        <div class="text-center">
            <div class="font-bold">0</div>
            <div class="text-sm text-gray-600">Posts</div>
        </div>
        <div class="text-center">
            <div class="font-bold">0</div>
            <div class="text-sm text-gray-600">Followers</div>
        </div>
        <div class="text-center">
            <div class="font-bold">0</div>
            <div class="text-sm text-gray-600">Following</div>
        </div>
    </div>

    <!-- Profile Bio -->
    <div class="mt-4">
        <p class="text-sm">No bio yet.</p>
    </div>

    <!-- Profile Tabs -->
    <div class="mt-6 border-b">
        <div class="flex gap-6">
            <Button variant="ghost" class="flex items-center gap-2">
                <Grid class="h-4 w-4" />
                Posts
            </Button>
            <Button variant="ghost" class="flex items-center gap-2">
                <Heart class="h-4 w-4" />
                Liked
            </Button>
            <Button variant="ghost" class="flex items-center gap-2">
                <BookmarkIcon class="h-4 w-4" />
                Saved
            </Button>
        </div>
    </div>

    <!-- Profile Content -->
    <div class="mt-6">
        <div class="grid grid-cols-3 gap-1">
            <div class="aspect-square bg-gray-100"></div>
            <div class="aspect-square bg-gray-100"></div>
            <div class="aspect-square bg-gray-100"></div>
        </div>
    </div>
</div>
