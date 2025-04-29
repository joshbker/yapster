<script>
    import { Button } from "$lib/component/ui/button"
    import { UserMinus, UserPlus } from "lucide-svelte"
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { triggerProfileUpdate } from "$lib/data/userStore";

    const isSmallScreen = writable(true); // Default to true for mobile-first

    onMount(() => {
        // Check if window is defined (client-side)
        if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(max-width: 1024px)'); // lg breakpoint in Tailwind is 1024px
            $isSmallScreen = mediaQuery.matches;

            // Update isSmallScreen when viewport changes
            const handler = (e) => {
                $isSmallScreen = e.matches;
            };
            mediaQuery.addEventListener('change', handler);

            return () => {
                mediaQuery.removeEventListener('change', handler);
            };
        }
    });

    export let user;
    export let viewer;
    export let iconOnly = undefined;
    export let className = "px-2 h-8";

    // Make isFollowing fully reactive to user's followers list
    $: isFollowing = user?.followers?.includes(viewer?.id) ?? false;

    async function follow() {
        try {
            const response = await fetch(`/api/me/user/${user.id}/follow`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to follow user');
            }

            // Update the local state by modifying the viewer's following array
            viewer.following = isFollowing 
                ? viewer.following.filter(id => id !== user.id)
                : [...viewer.following, user.id];

            // Update the user's followers array
            user.followers = isFollowing
                ? user.followers.filter(id => id !== viewer.id)
                : [...user.followers, viewer.id];

            // Trigger profile update for both the user being followed/unfollowed and the viewer
            triggerProfileUpdate(user.id, viewer.id);
        } catch (err) {
            console.error('Failed to follow/unfollow:', err);
            alert(err.message);
        }
    }
</script>

{#if isFollowing}
    <Button variant="outline" class="flex items-center gap-1.5 {className}" on:click={(e) => {
        e.preventDefault();
        e.stopPropagation();
        follow();
    }}>
        <UserMinus class="h-4 w-4" />
        {#if iconOnly === undefined ? !$isSmallScreen : !iconOnly}
            <p>Unfollow</p>
        {/if}
    </Button>
{:else}
    <Button class="flex items-center gap-1.5 {className}" on:click={(e) => {
        e.preventDefault();
        e.stopPropagation();
        follow();
    }}>
        <UserPlus class="h-4 w-4" />
        {#if iconOnly === undefined ? !$isSmallScreen : !iconOnly}
            <p>Follow</p>
        {/if}
    </Button>
{/if}