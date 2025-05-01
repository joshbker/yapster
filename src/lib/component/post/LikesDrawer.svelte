<script>
    import * as Drawer from "$lib/component/ui/drawer";
    import { writable } from 'svelte/store';
    import { getUserById } from "$lib/util";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import ProfileCardSlim from "$lib/component/profile/ProfileCardSlim.svelte";
    import { Loader2 } from "lucide-svelte";
    import { updatedLikes } from "$lib/data/likeStore";

    export let open = false;
    export let likes = [];
    export let viewer;
    export let likeState = false;
    export let size = "sm";
    export let id; // Add this prop to identify which post/comment this drawer belongs to

    // Store for users who liked
    const likeUsers = writable([]);
    const isLoadingLikes = writable(false);
    let hasInitiallyLoaded = false;

    // Only load users when drawer opens and we haven't loaded them yet
    $: if (open && !hasInitiallyLoaded && !$isLoadingLikes) {
        hasInitiallyLoaded = true;
        loadLikeUsers();
    }

    // Reset loaded state when likes array changes
    $: if (likes) {
        if (!Array.isArray(likes) || likes.length === 0) {
            $likeUsers = [];
            hasInitiallyLoaded = true;
        } else if ($likeUsers.length > 0 && $likeUsers.length !== likes.length) {
            // Only reset if we had previously loaded users and the count changed
            hasInitiallyLoaded = false;
            $likeUsers = [];
        }
    }

    // Listen for updates to this post/comment's likes
    $: if (id && $updatedLikes.has(id)) {
        hasInitiallyLoaded = false;
        if (open) {
            loadLikeUsers();
        }
    }

    async function loadLikeUsers() {
        if ($isLoadingLikes || !Array.isArray(likes)) {
            return;
        }

        if (likes.length === 0) {
            $likeUsers = [];
            return;
        }

        $isLoadingLikes = true;
        try {
            // Load users in batches of 5 to prevent overwhelming the server
            const batchSize = 5;
            const batches = [];
            
            for (let i = 0; i < likes.length; i += batchSize) {
                const batch = likes.slice(i, i + batchSize);
                const users = await Promise.all(batch.map(id => getUserById(id)));
                batches.push(...users);
                
                // Update the store with each batch
                $likeUsers = batches.filter(Boolean);
            }
        } catch (err) {
            console.error('Failed to load users who liked:', err);
            toast.error("Failed to load users");
            $likeUsers = [];
        } finally {
            $isLoadingLikes = false;
        }
    }
</script>

<Drawer.Root bind:open>
    <Drawer.Trigger>
        <button 
            class="text-{size} hover:underline px-1 {likeState ? 'text-red-500 hover:text-red-600' : ''}"
        >
            {likes?.length ?? 0}
        </button>
    </Drawer.Trigger>
    <Drawer.Portal>
        <Drawer.Content>
            <div class="mx-auto w-full max-w-sm">
                <Drawer.Header>
                    <Drawer.Title class="text-base font-semibold text-center">Likes</Drawer.Title>
                </Drawer.Header>
                <div class="px-4 h-[70vh] overflow-y-auto">
                    {#if $isLoadingLikes}
                        <div class="py-4 flex justify-center">
                            <Loader2 class="h-6 w-6 animate-spin" />
                        </div>
                    {:else if $likeUsers.length > 0}
                        <div class="space-y-2 pb-4">
                            {#each $likeUsers as user}
                                <button 
                                    class="w-full"
                                    on:click={() => {
                                        open = false;
                                        goto(`/@${user.username}`);
                                    }}
                                >
                                    <ProfileCardSlim {user} {viewer} />
                                </button>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-center text-muted-foreground text-sm">No likes yet</p>
                    {/if}
                </div>
                <Drawer.Footer class="mb-12"></Drawer.Footer>
            </div>
        </Drawer.Content>
    </Drawer.Portal>
</Drawer.Root> 