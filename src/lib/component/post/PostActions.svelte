<script>
    import { Heart, MessageCircle, Forward, Bookmark, MoreHorizontal, Flag, Ban, BellOff, ExternalLink } from "lucide-svelte";
    import { PUBLIC_BASE_URL } from "$env/static/public";
    import { toast } from "svelte-sonner";
    import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "$lib/component/ui/dropdown-menu"
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";

    export let post;
    export let viewer;

    async function handleShare() {
        await navigator.clipboard.writeText(`${PUBLIC_BASE_URL}/p/${post.id}`);
        toast.success("Link copied to clipboard!", {
            duration: 2000
        });
    }
</script>

<div class="flex w-full justify-between">
    <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 hover:text-red-500 transition-colors">
            <Heart class="h-4 w-4" />
            <span class="text-sm">{post.likes?.length ?? 0}</span>
        </button>
        <button class="flex items-center gap-2 hover:text-blue-400 transition-colors">
            <MessageCircle class="h-4 w-4" />
            <span class="text-sm">{post.comments?.length ?? 0}</span>
        </button>
        <button class="hover:text-green-400 transition-colors" on:click={handleShare}>
            <Forward class="h-4 w-4" />
        </button>
    </div>
    <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 hover:text-yellow-400 transition-colors">
            <Bookmark class="h-4 w-4" />
            <span class="text-sm">{post.saves?.length ?? 0}</span>
        </button>
        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <button class="hover:bg-foreground/10 rounded-lg p-2 transition-colors">
                    <MoreHorizontal class="h-4 w-4" />
                </button>   
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {#if $page.url.pathname !== `/p/${post.id}`}
                    <DropdownMenuItem class="gap-2" on:click={() => goto(`/p/${post.id}`)}>
                        <ExternalLink class="h-4 w-4" />
                        <p>Open Full Post</p>
                    </DropdownMenuItem>
                {/if}
                <DropdownMenuItem class="gap-2 !text-destructive" on:click={() => {
                    alert("Report Post");
                }}>
                    <Flag class="h-4 w-4" />
                    <p>Report Post</p>
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-2 !text-destructive" on:click={() => {
                    alert("Block User");
                }}>
                    <Ban class="h-4 w-4" />
                    <p>Block User</p>
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-2" on:click={() => {
                    alert("Ignore User");
                }}>
                    <BellOff class="h-4 w-4" />
                    <p>Ignore User</p>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</div>