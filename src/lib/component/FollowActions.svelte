<script>
    import { Button } from "$lib/component/ui/button"
    import { UserMinus, UserPlus } from "lucide-svelte"
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

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
    export let iconOnly = undefined
    export let className = "px-2 h-8"

    $: isFollowing = viewer.following.includes(user.id);
</script>

{#if isFollowing}
    <Button variant="outline" class="flex items-center gap-1.5 {className}" on:click={(e) => {
        e.preventDefault();
        e.stopPropagation();
        alert("Unfollow");
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
        alert("Follow");
    }}>
        <UserPlus class="h-4 w-4" />
        {#if iconOnly === undefined ? !$isSmallScreen : !iconOnly}
            <p>Follow</p>
        {/if}
    </Button>
{/if}