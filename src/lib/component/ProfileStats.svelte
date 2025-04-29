<script>
    import { onMount } from 'svelte';
    import FollowersDialog from "$lib/component/FollowersDialog.svelte"
    import { getUserById } from "$lib/util";
    import { updatedUsers } from "$lib/data/userStore";
    import { writable } from 'svelte/store';

    export let user;

    let showDialog = false;
    let initialTab = "following";
    
    // Pagination settings
    const PAGE_SIZE = 20;
    const followingPage = writable(0);
    const followersPage = writable(0);
    const isLoadingMore = writable(false);
    
    // Stores for followers/following data
    const followingUsers = writable([]);
    const followerUsers = writable([]);
    const followingCount = writable(0);
    const followersCount = writable(0);

    // Function to fetch paginated following data
    async function loadMoreFollowing() {
        if ($isLoadingMore) return;
        
        $isLoadingMore = true;
        try {
            const skip = $followingPage * PAGE_SIZE;
            const userIds = user.following?.slice(skip, skip + PAGE_SIZE) ?? [];
            
            if (userIds.length === 0) return;
            
            const users = await Promise.all(userIds.map(id => getUserById(id)));
            $followingUsers = [...$followingUsers, ...users.filter(Boolean)];
            $followingPage++;
        } catch (err) {
            console.error('Failed to load more following:', err);
        } finally {
            $isLoadingMore = false;
        }
    }

    // Function to fetch paginated followers data
    async function loadMoreFollowers() {
        if ($isLoadingMore) return;
        
        $isLoadingMore = true;
        try {
            const skip = $followersPage * PAGE_SIZE;
            const userIds = user.followers?.slice(skip, skip + PAGE_SIZE) ?? [];
            
            if (userIds.length === 0) return;
            
            const users = await Promise.all(userIds.map(id => getUserById(id)));
            $followerUsers = [...$followerUsers, ...users.filter(Boolean)];
            $followersPage++;
        } catch (err) {
            console.error('Failed to load more followers:', err);
        } finally {
            $isLoadingMore = false;
        }
    }

    // Function to reset and initialize data
    function resetData() {
        $followingPage = 0;
        $followersPage = 0;
        $followingUsers = [];
        $followerUsers = [];
        $followingCount = user.following?.length ?? 0;
        $followersCount = user.followers?.length ?? 0;
    }

    // Initialize data on mount and when user updates
    $: if (user) {
        resetData();
    }

    // Subscribe to updates for this specific user
    $: if ($updatedUsers.has(user.id)) {
        resetData();
    }

    onMount(() => {
        resetData();
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
            // Load first page of following data when dialog opens
            if ($followingUsers.length === 0) {
                loadMoreFollowing();
            }
        }}
    >
        <span class="font-semibold">{$followingCount ?? 0}</span> following
    </button>
    <button 
        class="text-sm text-muted-foreground hover:underline"
        on:click={(e) => {
            e.preventDefault();
            e.stopPropagation();
            showDialog = true;
            initialTab = "followers";
            // Load first page of followers data when dialog opens
            if ($followerUsers.length === 0) {
                loadMoreFollowers();
            }
        }}
    >
        <span class="font-semibold">{$followersCount ?? 0}</span> followers
    </button>
    <p class="text-sm text-muted-foreground">
        <span class="font-semibold">{user.posts?.length ?? 0}</span> posts
    </p>
</div>

<FollowersDialog 
    bind:open={showDialog}
    followingUsers={$followingUsers}
    followerUsers={$followerUsers}
    {loadMoreFollowing}
    {loadMoreFollowers}
    followingCount={$followingCount}
    followersCount={$followersCount}
    isLoadingMore={$isLoadingMore}
    initialTab={initialTab}
    on:close={() => {
        showDialog = false;
    }}
/>