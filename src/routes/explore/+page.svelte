<script>
    import { onMount } from 'svelte';
    import ProfileCard from "$lib/component/ProfileCard.svelte";
    import { page } from "$app/stores";

    let users = [];
    let loading = true;
    let error = null;

    $: viewer = $page.data.user

    async function fetchUsers() {
        try {
            loading = true;
            const response = await fetch('/api/user/discover');
            if (!response.ok) throw new Error('Failed to fetch users');
            users = await response.json();
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchUsers();
    })
</script>

<svelte:head>
    <title>Explore | Yapster</title>
</svelte:head>

<div class="container max-w-7xl px-4 py-4">
    <h1 class="text-xl font-bold mb-4">Explore</h1>

    {#if loading}
        <div class="text-center py-12">
            <p class="text-muted-foreground">Loading users...</p>
        </div>
    {:else if error}
        <div class="text-center py-12">
            <p class="text-destructive">Error: {error}</p>
        </div>
    {:else if users.length === 0}
        <div class="text-center py-12">
            <p class="text-muted-foreground">No users found</p>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each users as user}
                <ProfileCard {user} {viewer} />
            {/each}
        </div>
    {/if}
</div>