<script>
    import { page } from "$app/stores"
    import { Button } from '$lib/component/ui/button';
    import { Settings, Pencil, Circle } from "lucide-svelte"
    import BadgeVerified from "$lib/component/BadgeVerified.svelte"
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public"
    import ProfileActions from "$lib/component/ProfileActions.svelte"
    import FollowActions from "$lib/component/FollowActions.svelte"
    import MessageActions from "$lib/component/MessageActions.svelte"
    import ProfileStats from "$lib/component/ProfileStats.svelte"

    $: user = $page.data.displayedUser
    $: viewer = $page.data.user
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
            <div class="flex items-center gap-1.5">
                {#if user.name}
                    <p class="text-sm font-medium text-muted-foreground">{user.username}</p>
                {/if}
                {#if user.pronouns}
                    <Circle class="h-1.5 w-1.5 fill-muted-foreground text-muted-foreground -mb-0.5" />
                    <p class="text-sm font-medium text-muted-foreground">{user.pronouns}</p>
                {/if}
            </div>
        </div>

        <div class="flex gap-2">
            {#if user.username === viewer.username}
                <Button variant="outline" class="px-2 h-8 flex items-center gap-1.5" href="/account/profile">
                    <Pencil class="h-4 w-4" />
                    <p class="hidden lg:block">Edit Profile</p>
                </Button>
                <Button variant="outline" class="px-2 h-8 flex items-center gap-1.5" href="/account/settings">
                    <Settings class="h-4 w-4" />
                    <p class="hidden lg:block">Settings</p>
                </Button>
            {:else}
                <FollowActions {user} {viewer} />
                <MessageActions {user} {viewer} />
                <ProfileActions {user} {viewer} />
            {/if}
        </div>
    </div>

    <div class="mt-2">
        <p class="text-sm">{user.bio ?? "No bio yet."}</p>
    </div>

    <div class="mt-4">
        <ProfileStats {user} {viewer} />
    </div>
</div>
