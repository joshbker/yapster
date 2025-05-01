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

<a class="border rounded-lg flex flex-col h-full" href={`/@${user.username}`} data-sveltekit-preload-data="off">
    <div class="relative">
        {#if user.banner}
            <img src={user.banner} alt="Banner" class="w-full h-24 object-cover rounded-t-lg bg-background">
        {:else}
            <div class="w-full h-24 bg-gradient-to-br from-purple-500 to-blue-400 rounded-t-lg"></div>
        {/if}
        <img 
            src={user.image ?? PUBLIC_DEFAULT_AVATAR_URL} 
            alt={user.username}
            class="absolute left-4 -bottom-6 w-16 h-16 rounded-full object-cover border-[3px] border-background bg-background"
        >
    </div>
    
    <div class="p-6 pt-6 flex flex-col flex-1 bg-background">
        <div class="flex items-start justify-between">
            <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <div class="flex items-center gap-1.5 min-w-0">
                        <h2 class="font-semibold truncate min-w-0 flex-1">{user.name ?? user.username}</h2>
                        {#if user.verified}
                            <BadgeVerified class="flex-shrink-0" />
                        {/if}
                    </div>
                    <div class="flex items-center gap-1.5 min-w-0 max-w-[300px]">
                        {#if user.name}
                            <p class="text-sm font-medium text-muted-foreground truncate min-w-0 flex-1">{user.username}</p>
                        {/if}
                        {#if user.pronouns}
                            <div class="flex items-center gap-1.5 min-w-0 flex-shrink-0">
                                <Circle class="h-1.5 w-1.5 fill-muted-foreground text-muted-foreground -mb-0.5" />
                                <p class="text-sm font-medium text-muted-foreground truncate min-w-0 max-w-[120px]">{user.pronouns}</p>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
            {#if user.id != viewer.id}
                <div class="flex-shrink-0 ml-4 -mt-1.5">
                    <ProfileActions {user} {viewer} />
                </div>
            {/if}
        </div>

        <p class="text-sm whitespace-pre-wrap line-clamp-1 mt-1">{user.bio ?? "No bio yet."}</p>

        <div class="flex flex-col mt-auto pt-3">
            <div>
                <ProfileStats {user} />
            </div>

            {#if user.id != viewer.id}
                <div class="flex gap-2 mt-3">
                    <FollowActions {user} {viewer} iconOnly={false} className="w-full" />
                    <MessageActions {user} {viewer} iconOnly={false} className="w-full" />
                </div>
            {/if}
        </div>
    </div>
</a>