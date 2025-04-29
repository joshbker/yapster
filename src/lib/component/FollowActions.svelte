<script>
    import { Button } from "$lib/component/ui/button"
    import { UserMinus, UserPlus, Loader2 } from "lucide-svelte"
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { triggerProfileUpdate } from "$lib/data/userStore";

    const isSmallScreen = writable(true); // Default to true for mobile-first
    const followState = writable(false);
    let isLoading = false;
    let followDebounceTimeout;

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

    // Make isFollowing fully reactive using the store
    $: $followState = user.followers.includes(viewer?.id) ?? false;

    // Debounced follow function
    function debouncedFollow() {
        if (followDebounceTimeout) {
            clearTimeout(followDebounceTimeout);
        }

        followDebounceTimeout = setTimeout(follow, 300);
    }

    async function follow() {
        if (isLoading) return;

        const wasFollowing = $followState;
        
        // Optimistic update
        $followState = !wasFollowing;
        isLoading = true;

        try {
            const response = await fetch(`/api/me/user/${user.id}/follow`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Revert on failure
                $followState = wasFollowing;
                const data = await response.json();
                throw new Error(data.message || 'Failed to follow user');
            }

            // Update the arrays based on the action
            if (wasFollowing) {
                // Unfollow: Remove IDs from both arrays
                user.followers = user.followers.filter(id => id !== viewer.id);
                viewer.following = viewer.following.filter(id => id !== user.id);
            } else {
                // Follow: Add IDs to both arrays
                user.followers = [...(user.followers || []), viewer.id];
                viewer.following = [...(viewer.following || []), user.id];
            }

            // Trigger profile update
            triggerProfileUpdate(user.id, viewer.id);
        } catch (err) {
            console.error('Failed to follow/unfollow:', err);
            alert(err.message);
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        return () => {
            if (followDebounceTimeout) {
                clearTimeout(followDebounceTimeout);
            }
        };
    });
</script>

{#if $followState}
    <Button 
        variant="outline" 
        class="flex items-center gap-1.5 {className}" 
        on:click={(e) => {
            e.preventDefault();
            e.stopPropagation();
            debouncedFollow();
        }}
        disabled={isLoading}
    >
        {#if isLoading}
            <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
            <UserMinus class="h-4 w-4" />
        {/if}
        {#if iconOnly === undefined ? !$isSmallScreen : !iconOnly}
            <p>Unfollow</p>
        {/if}
    </Button>
{:else}
    <Button 
        class="flex items-center gap-1.5 {className}" 
        on:click={(e) => {
            e.preventDefault();
            e.stopPropagation();
            debouncedFollow();
        }}
        disabled={isLoading}
    >
        {#if isLoading}
            <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
            <UserPlus class="h-4 w-4" />
        {/if}
        {#if iconOnly === undefined ? !$isSmallScreen : !iconOnly}
            <p>Follow</p>
        {/if}
    </Button>
{/if}