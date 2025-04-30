<script>
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public"
    import BadgeVerified from "$lib/component/profile/BadgeVerified.svelte"
    import FollowActions from "$lib/component/profile/FollowActions.svelte"
    import MessageActions from "$lib/component/profile/MessageActions.svelte"
    import ProfileActions from "$lib/component/profile/ProfileActions.svelte"
    import { goto } from "$app/navigation"

    export let user;
    export let viewer;

    function handleClick(e) {
        // If parent is a button, prevent default link behavior
        if (e.currentTarget.parentElement?.tagName === 'BUTTON') {
            e.preventDefault();
            // Use goto for client-side navigation after parent button's onClick completes
            setTimeout(() => goto(`/@${user.username}`), 0);
        }
    }
</script>

<a 
    href="/{user.username}" 
    class="flex justify-between p-2 hover:bg-muted rounded-lg"
    data-sveltekit-preload-data="off"
    on:click={handleClick}
>
    <div class="flex items-center gap-3">
        <img src={user.image ?? PUBLIC_DEFAULT_AVATAR_URL} alt="Avatar" class="w-10 h-10 rounded-full bg-background">
        <div class="flex flex-col items-start">
            <div class="flex items-center gap-1.5">
                <p class="font-medium">{user.name ?? user.username}</p>
                {#if user.verified}
                    <BadgeVerified size={16} />
                {/if}
            </div>
            {#if user.name}
                <p class="text-sm text-muted-foreground -mt-0.5">{user.username}</p>
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