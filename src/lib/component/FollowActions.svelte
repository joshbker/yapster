<script>
    import { page } from "$app/stores"
    import { Button } from "$lib/component/ui/button"
    import { UserMinus, UserPlus } from "lucide-svelte"

    export let user;
    export let viewer;
    $: isFollowing = viewer.following.includes(user.id);
</script>

{#if isFollowing}
    <Button variant="outline" class="px-2 h-8 flex items-center gap-1.5" on:click={(e) => {
        e.preventDefault();
        e.stopPropagation();
        alert("Unfollow");
    }}>
        <UserMinus class="h-4 w-4" />
        <p class="hidden lg:block">Unfollow</p>
    </Button>
{:else}
    <Button class="px-2 h-8 flex items-center gap-1.5" on:click={(e) => {
        e.preventDefault();
        e.stopPropagation();
        alert("Follow");
    }}>
        <UserPlus class="h-4 w-4" />
        <p class="hidden lg:block">Follow</p>
    </Button>
{/if}