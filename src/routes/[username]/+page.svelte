<script>
    import { page } from "$app/stores"
    import { Button } from '$lib/component/ui/button';
    import { Settings, Pencil, Circle } from "lucide-svelte"
    import { PUBLIC_BASE_URL } from "$env/static/public"
    import BadgeVerified from "$lib/component/profile/BadgeVerified.svelte"
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public"
    import ProfileActions from "$lib/component/profile/ProfileActions.svelte"
    import FollowActions from "$lib/component/profile/FollowActions.svelte"
    import MessageActions from "$lib/component/profile/MessageActions.svelte"
    import ProfileStats from "$lib/component/profile/ProfileStats.svelte"
    import PostGrid from "$lib/component/post/PostGrid.svelte"
    import { LogIn } from "lucide-svelte"

    $: user = $page.data.displayedUser
    $: viewer = $page.data.user
    $: profileTitle = `${user.name ?? user.username} • Yapster`
    $: profileDescription = user.bio ?? `Check out ${user.username}'s profile on Yapster`
    $: profileImage = (user.banner ?? user.image ?? PUBLIC_DEFAULT_AVATAR_URL)
</script>

<svelte:head>
    <!-- Basic Meta Tags -->
    <title>{profileTitle}</title>
    <meta name="description" content={profileDescription} />
    
    <!-- OpenGraph Meta Tags -->
    <meta property="og:site_name" content="Yapster" />
    <meta property="og:type" content="profile" />
    <meta property="og:title" content={profileTitle} />
    <meta property="og:description" content={profileDescription} />
    <meta property="og:url" content={PUBLIC_BASE_URL + "/" + user.username} />
    <meta property="og:image" content={profileImage} />
    <meta property="og:image:alt" content={`${user.username}'s profile`} />
    {#if user.banner}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
    {:else}
        <meta property="og:image:width" content="400" />
        <meta property="og:image:height" content="400" />
    {/if}
    
    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@yapster" />
    <meta name="twitter:creator" content={`${user.username}`} />
    <meta name="twitter:title" content={profileTitle} />
    <meta name="twitter:description" content={profileDescription} />
    <meta name="twitter:image" content={profileImage} />
</svelte:head>

<div class="relative lg:container lg:max-w-5xl lg:px-6 lg:py-6">
    {#if user.banner}
        <img src={user.banner} alt="Banner" class="w-full h-32 lg:h-48 object-cover lg:rounded-xl bg-background">
    {:else}
        <div class="w-full h-32 lg:h-48 lg:rounded-xl bg-gradient-to-br from-purple-500 to-blue-400"></div>
    {/if}
    <img src={user.image ?? PUBLIC_DEFAULT_AVATAR_URL} alt="Avatar" class="absolute left-3 lg:left-14 -bottom-8 lg:-bottom-2 w-24 h-24 rounded-full object-cover border-4 border-background bg-background">
</div>
<div class="container max-w-4xl px-0 py-2 mt-6 lg:mt-0">
    <div class="flex flex-col mx-4 lg:mx-0">
        <div class="flex items-start justify-between">
            <div class="container-type-inline-size min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <div class="flex items-center gap-1.5 min-w-0">
                        <h1 class="text-lg font-bold truncate min-w-0 flex-1">{user.name ?? user.username}</h1>
                        {#if user.verified}
                            <BadgeVerified class="flex-shrink-0" />
                        {/if}
                    </div>
                    <div class="flex items-center gap-1.5 max-w-[90dvw]">
                        {#if user.name}
                            <p class="text-sm font-medium text-muted-foreground flex-shrink max-w-[200px] lg:max-w-none truncate">{user.username}</p>
                        {/if}
                        {#if user.pronouns}
                            <div class="flex items-center gap-1.5 flex-shrink-0">
                                <Circle class="h-1.5 w-1.5 fill-muted-foreground text-muted-foreground -mb-0.5" />
                                <p class="text-sm font-medium text-muted-foreground flex-shrink max-w-[200px] lg:max-w-none truncate">{user.pronouns}</p>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
    
            {#if viewer}
                <div class="flex gap-2 flex-shrink-0 ml-4">
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
            {/if}
        </div>
    
        <div class="mt-2">
            <p class="text-sm whitespace-pre-wrap">{user.bio ?? "No bio yet."}</p>
        </div>
    
        <div class="mt-4">
            {#if viewer}
                <ProfileStats {user} />
            {:else}
                <div class="flex items-center gap-4">
                    <p class="text-sm text-muted-foreground">
                        <span class="font-semibold">{user.followers}</span> {(user.followers ?? 0) === 1 ? 'follower' : 'followers'}
                    </p>
                    <p class="text-sm text-muted-foreground">
                        <span class="font-semibold">{user.following}</span> {(user.following ?? 0) === 1 ? 'following' : 'following'}
                    </p>
                    <p class="text-sm text-muted-foreground">
                        <span class="font-semibold">{user.posts}</span> {(user.posts ?? 0) === 1 ? 'post' : 'posts'}
                    </p>
                </div>
            {/if}
        </div>
    </div>

    {#if viewer}
        <div class="mt-6">
            <PostGrid postIds={[...user.posts].reverse()} />
        </div>
    {:else}
        <div class="mt-12 w-full flex flex-col items-center gap-4">
            <p class="text-sm text-muted-foreground">Log in to view this user's posts.</p>
            <Button class="flex items-center gap-1.5" href="/account/login">
                <LogIn class="h-4 w-4" />
                <p>Log in</p>
            </Button>
        </div>
    {/if}
</div>