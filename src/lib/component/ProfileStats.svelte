<script>
    import { onMount } from 'svelte';
    import FollowersDialog from "$lib/component/FollowersDialog.svelte"
    import { getUserById } from "$lib/util";
    import { updatedUsers } from "$lib/data/userStore";

    export let user;

    let showDialog = false;
    let initialTab = "following";
    
    let followingPromise;
    let followersPromise;
    let followingCount;
    let followersCount;

    // Function to fetch the data
    function fetchData() {
        followingCount = user.following?.length ?? 0;
        followersCount = user.followers?.length ?? 0;
        
        followingPromise = user.following?.length 
            ? Promise.all(user.following.map(id => getUserById(id)))
            : Promise.resolve([]);
        
        followersPromise = user.followers?.length 
            ? Promise.all(user.followers.map(id => getUserById(id)))
            : Promise.resolve([]);
    }


    // Subscribe to updates for this specific user
    $: if ($updatedUsers.has(user.id)) {
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
        <span class="font-semibold">{followingCount}</span> following
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
        <span class="font-semibold">{followersCount}</span> followers
    </button>
    <p class="text-sm text-muted-foreground"><span class="font-semibold">{user.posts?.length ?? 0}</span> posts</p>
</div>

<FollowersDialog 
    bind:open={showDialog}
    {followingPromise}
    {followersPromise}
    {followingCount}
    {followersCount}
    initialTab={initialTab}
    on:close={() => {
        showDialog = false;
    }}
/>