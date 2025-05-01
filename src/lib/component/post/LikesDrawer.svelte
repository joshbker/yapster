<script>
    import * as Drawer from "$lib/component/ui/drawer";
    import { writable } from 'svelte/store';
    import { getUserById } from "$lib/util";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import ProfileCardSlim from "$lib/component/profile/ProfileCardSlim.svelte";
    import { Loader2 } from "lucide-svelte";

    export let open = false;
    export let likes = [];
    export let viewer;
    export let likeState = false;
    export let size = "sm";

    // Store for users who liked
    const likeUsers = writable([]);
    const isLoadingLikes = writable(false);

    // Load users who liked when drawer opens
    $: if (open && likes && (!$likeUsers.length || $likeUsers.length !== likes.length)) {
        loadLikeUsers();
    }

    async function loadLikeUsers() {
        if ($isLoadingLikes) return;
        
        $isLoadingLikes = true;
        try {
            const users = await Promise.all(likes.map(id => getUserById(id)));
            $likeUsers = users.filter(Boolean);
        } catch (err) {
            console.error('Failed to load users who liked:', err);
            toast.error("Failed to load users");
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