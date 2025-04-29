<script>
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public"
    import BadgeVerified from "$lib/component/BadgeVerified.svelte"
    import FollowActions from "$lib/component/FollowActions.svelte"
    import MessageActions from "$lib/component/MessageActions.svelte"
    import ProfileActions from "$lib/component/ProfileActions.svelte"

    export let user;
    export let viewer;
</script>

<a 
    href="/{user.username}" 
    class="flex justify-between p-2 hover:bg-muted rounded-lg"
    data-sveltekit-preload-data="off"
>
    <div class="flex items-center gap-3">
        <img src={user.image ?? PUBLIC_DEFAULT_AVATAR_URL} alt="Avatar" class="w-10 h-10 rounded-full">
        <div>
            <div class="flex items-center gap-1">
                <p class="font-medium">{user.name ?? user.username}</p>
                {#if user.verified}
                    <BadgeVerified size={16} />
                {/if}
            </div>
            {#if user.name}
                <p class="text-sm text-muted-foreground">{user.username}</p>
            {/if}
        </div>
    </div>

    {#if viewer.username !== user.username}
        <div class="flex items-center gap-2">
            <FollowActions {user} {viewer} />
            <MessageActions {user} {viewer} />
            <ProfileActions {user} {viewer} /> 
        </div>
    {/if}
</a>