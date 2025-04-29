<script>
    import { onMount } from 'svelte';
    import FollowersDialog from "$lib/component/FollowersDialog.svelte"
    import { getUserById } from "$lib/util";

    export let user;

    let showDialog = false;
    let initialTab = "following";
    
    let followingPromise;
    let followersPromise;

    // Function to fetch the data
    function fetchData() {
        followingPromise = user.following?.length 
            ? Promise.all(user.following.map(id => getUserById(id)))
            : Promise.resolve([]);
        
        followersPromise = user.followers?.length 
            ? Promise.all(user.followers.map(id => getUserById(id)))
            : Promise.resolve([]);
    }

    // React to user changes
    $: if (user) {
        fetchData();
    }

    onMount(() => {
        fetchData();
    });
</script>

<div class="flex gap-6">
    <button 
        class="text-sm text-muted-foreground hover:underline"
        on:click={(e) => {
            e.preventDefault();
            e.stopPropagation();
            showDialog = true;
            initialTab = "following";
        }}
    >
        <span class="font-semibold">{user.following?.length ?? 0}</span> following
    </button>
    <button 
        class="text-sm text-muted-foreground hover:underline"
        on:click={(e) => {
            e.preventDefault();
            e.stopPropagation();
            showDialog = true;
            initialTab = "followers";
        }}
    >
        <span class="font-semibold">{user.followers?.length ?? 0}</span> followers
    </button>
    <p class="text-sm text-muted-foreground"><span class="font-semibold">{user.posts?.length ?? 0}</span> posts</p>
</div>

<FollowersDialog 
    bind:open={showDialog}
    {followingPromise}
    {followersPromise}
    initialTab={initialTab}
    on:close={() => {
        showDialog = false;
    }}
/>