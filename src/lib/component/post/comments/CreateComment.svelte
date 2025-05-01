<script>
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public";
    import { Loader2 } from "lucide-svelte";
    import { Button } from "$lib/component/ui/button";
    import { Textarea } from "$lib/component/ui/textarea";
    import * as Card from "$lib/component/ui/card";
    import { toast } from "svelte-sonner";

    export let postId;
    export let viewer;
    export let onCommentCreated;

    let newComment = "";
    let isSubmitting = false;

    async function handleSubmitComment() {
        if (!newComment.trim() || isSubmitting) return;

        isSubmitting = true;
        try {
            const response = await fetch(`/api/post/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: newComment.trim() })
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }

            const data = await response.json();
            onCommentCreated(data);
            newComment = "";
            toast.success("Comment posted!");
        } catch (err) {
            console.error('Failed to post comment:', err);
            toast.error("Failed to post comment");
        } finally {
            isSubmitting = false;
        }
    }
</script>


<div class="relative">
    <Textarea
        bind:value={newComment}
        placeholder="wanna yap back?"
        class="w-full min-h-[80px] resize-none pr-24"
    />
    <div class="absolute bottom-2 right-2">
        <Button 
            disabled={!newComment.trim() || isSubmitting}
            size="sm"
            class="text-xs"
            on:click={handleSubmitComment}
        >
            {#if isSubmitting}
                Commenting...
            {:else}
                Comment
            {/if}
        </Button>
    </div>
</div>