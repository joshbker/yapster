<script>
    import { page } from "$app/stores"
    import { Button } from '$lib/component/ui/button';
    import { 
        Settings,
        MessageSquare,
        UserPlus,
        Grid,
        BookmarkIcon,
        Heart
    } from "lucide-svelte"
</script>

<div class="container max-w-4xl px-4 py-6">
    <!-- Profile Header -->
    <div class="flex items-start justify-between">
        <div class="flex items-center gap-4">
            <div class="h-20 w-20 rounded-full bg-gray-200">
                <!-- Profile picture placeholder -->
            </div>
            <div>
                <h1 class="text-2xl font-bold">{$page.data.params.username}</h1>
                <p class="text-sm text-gray-600">@{$page.data.params.username}</p>
            </div>
        </div>
        <div class="flex gap-2">
            {#if $page.data.params.username === $page.data.user.username}
                <Button variant="outline" href="/account/settings">
                    <Settings class="mr-2 h-4 w-4" />
                    Edit Profile
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
