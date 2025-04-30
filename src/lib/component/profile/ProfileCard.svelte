<script>
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public"
    import BadgeVerified from "$lib/component/profile/BadgeVerified.svelte"
    import ProfileActions from "$lib/component/profile/ProfileActions.svelte"
    import FollowActions from "$lib/component/profile/FollowActions.svelte"
    import MessageActions from "$lib/component/profile/MessageActions.svelte"
    import ProfileStats from "$lib/component/profile/ProfileStats.svelte"
    import { Circle } from "lucide-svelte"

    export let user;
    export let viewer;
</script>

<a class="border rounded-lg flex flex-col" href={`/${user.username}`} data-sveltekit-preload-data="off">
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
    
    <div class="p-6 pt-6 flex flex-col bg-background">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
                <div class="flex items-center gap-1.5">
                    <h2 class="font-semibold">{user.name ?? user.username}</h2>
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
            {#if user.id != viewer.id}
                <ProfileActions {user} {viewer} />
            {/if}
        </div>

        <p class="text-sm whitespace-pre-wrap line-clamp-1">{user.bio ?? "No bio yet."}</p>

        <div class="mt-3">
            <ProfileStats {user} {viewer} />
        </div>

        {#if user.id != viewer.id}
            <div class="flex gap-2 mt-3">
                <FollowActions {user} {viewer} iconOnly={false} className="w-full" />
                <MessageActions {user} {viewer} iconOnly={false} className="w-full" />
            </div>
        {/if}
    </div>
</a>