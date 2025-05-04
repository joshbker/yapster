<script>
    import * as Drawer from "$lib/component/ui/drawer";
    import { writable } from 'svelte/store';
    import { getUserById } from "$lib/util";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import ProfileCardSlim from "$lib/component/profile/ProfileCardSlim.svelte";
    import { Loader2 } from "lucide-svelte";
    import { updatedSaves } from "$lib/data/saveStore";

    export let open = false;
    export let saves = [];
    export let viewer;
    export let saveState = false;
    export let size = "sm";
    export let id;
    export let saveCount = saves?.length ?? 0;

    // Store for users who saved
    const saveUsers = writable([]);
    const isLoadingSaves = writable(false);
    let hasInitiallyLoaded = false;

    // Only load users when drawer opens and we haven't loaded them yet
    $: if (open && !hasInitiallyLoaded && !$isLoadingSaves) {
        hasInitiallyLoaded = true;
        loadSaveUsers();
    }

    // Reset loaded state when saves array changes
    $: if (saves) {
        if (!Array.isArray(saves) || saves.length === 0) {
            $saveUsers = [];
            hasInitiallyLoaded = true;
        } else if ($saveUsers.length > 0 && $saveUsers.length !== saves.length) {
            // Only reset if we had previously loaded users and the count changed
            hasInitiallyLoaded = false;
            $saveUsers = [];
        }
    }

    // Listen for updates to this post's saves
    $: if (id && $updatedSaves.has(id)) {
        hasInitiallyLoaded = false;
        if (open) {
            loadSaveUsers();
        }
    }

    async function loadSaveUsers() {
        if ($isLoadingSaves || !Array.isArray(saves)) {
            return;
        }

        if (saves.length === 0) {
            $saveUsers = [];
            return;
        }

        $isLoadingSaves = true;
        try {
            // Load users in batches of 5 to prevent overwhelming the server
            const batchSize = 5;
            const batches = [];
            
            for (let i = 0; i < saves.length; i += batchSize) {
                const batch = saves.slice(i, i + batchSize);
                const users = await Promise.all(batch.map(id => getUserById(id)));
                batches.push(...users);
                
                // Update the store with each batch
                $saveUsers = batches.filter(Boolean);
            }
        } catch (err) {
            console.error('Failed to load users who saved:', err);
            toast.error("Failed to load users");
            $saveUsers = [];
        } finally {
            $isLoadingSaves = false;
        }
    }
</script>

<Drawer.Root bind:open>
    <Drawer.Trigger>
        <button 
            class="text-{size} hover:underline px-2 {saveState ? 'text-yellow-400 hover:text-yellow-500' : ''}"
        >
            {saveCount}
        </button>
    </Drawer.Trigger>
    <Drawer.Portal>
        <Drawer.Content>
            <div class="mx-auto w-full max-w-sm">
                <Drawer.Header>
                    <Drawer.Title class="text-base font-semibold text-center">Saves</Drawer.Title>
                </Drawer.Header>
                <div class="px-4 h-[70vh] overflow-y-auto">
                    {#if $isLoadingSaves}
                        <div class="py-4 flex justify-center">
                            <Loader2 class="h-6 w-6 animate-spin" />
                        </div>
                    {:else if $saveUsers.length > 0}
                        <div class="space-y-2 pb-4">
                            {#each $saveUsers as user}
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
                        <p class="text-center text-muted-foreground text-sm">No saves yet</p>
                    {/if}
                </div>
                <Drawer.Footer class="mb-12"></Drawer.Footer>
            </div>
        </Drawer.Content>
    </Drawer.Portal>
</Drawer.Root> 