<script>
    import { Heart, MessageCircle, Forward, Bookmark } from "lucide-svelte";
    import { PUBLIC_BASE_URL } from "$env/static/public";
    import { toast } from "svelte-sonner";

    export let post;
    export let viewer;

    async function handleShare() {
        const postUrl = `${PUBLIC_BASE_URL}/p/${post.id}`;
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard!", {
            duration: 2000
        });
    }
</script>

<div class="flex w-full justify-between">
    <div class="flex items-center gap-1 -ml-1.5 ">
        <button class="flex items-center gap-2 h-8 px-2 hover:text-red-500 transition-colors">
            <Heart class="h-5 w-5" />
            <span>{post.likes?.length ?? 0}</span>
        </button>
        <button class="flex items-center gap-2 h-8 px-2 hover:text-blue-400 transition-colors">
            <MessageCircle class="h-5 w-5" />
            <span>{post.comments?.length ?? 0}</span>
        </button>
        <button class="h-8 px-2 hover:text-green-400 transition-colors" on:click={handleShare}>
            <Forward class="h-5 w-5" />
        </button>
    </div>
    <button class="flex items-center gap-2 h-8 px-2 hover:text-yellow-400 transition-colors">
        <Bookmark class="h-5 w-5" />
        <span>{post.saves?.length ?? 0}</span>
    </button>
</div>