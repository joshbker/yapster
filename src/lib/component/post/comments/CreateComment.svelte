<script>
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public";
    import { Loader2, X, Send } from "lucide-svelte";
    import { Button } from "$lib/component/ui/button";
    import * as Card from "$lib/component/ui/card";
    import { toast } from "svelte-sonner";
    import { replyingTo } from "$lib/store/replyStore.js";
    import { onMount } from "svelte";
    import { cn } from "$lib/util";
    
    export let postId;
    export let viewer;
    export let onCommentCreated;
    
    let newComment = "";
    let isSubmitting = false;
    let textareaElement;
    
    // Function to adjust textarea height
    function adjustHeight() {
        if (!textareaElement) return;
        
        // Reset height to calculate the right scrollHeight
        textareaElement.style.height = "38px";
        
        // Get the scroll height
        const scrollHeight = textareaElement.scrollHeight;
        
        // Set height based on content, but capped at max height
        if (scrollHeight <= 96) {
            textareaElement.style.height = scrollHeight + "px";
            textareaElement.style.overflowY = "hidden";
        } else {
            textareaElement.style.height = "96px";
            textareaElement.style.overflowY = "auto";
        }
    }
    
    // Initialize after component is mounted
    onMount(() => {
        if (textareaElement) {
            adjustHeight();
        }
    });
    
    // Watch for changes to replyingTo and safely focus the textarea
    $: if ($replyingTo && textareaElement?.focus) {
        setTimeout(() => {
            textareaElement?.focus();
        }, 0);
    }
    
    // Watch for changes to newComment
    $: if (textareaElement && newComment !== undefined) {
        setTimeout(adjustHeight, 0);
    }
    
    async function handleSubmitComment() {
        if (!newComment.trim() || isSubmitting) return;
        isSubmitting = true;
        try {
            const response = await fetch(`/api/post/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: newComment.trim(),
                    parentId: $replyingTo?.commentId || null
                })
            });
            if (!response.ok) {
                throw new Error('Failed to post comment');
            }
            const data = await response.json();
            onCommentCreated(data);
            newComment = "";
            replyingTo.set(null); // Clear reply context after posting
            toast.success($replyingTo ? "Reply posted!" : "Comment posted!");
        } catch (err) {
            console.error('Failed to post comment:', err);
            toast.error("Failed to post comment");
        } finally {
            isSubmitting = false;
        }
    }
    
    function clearReply() {
        replyingTo.set(null);
    }
</script>

<div class="fixed bottom-[4.4rem] left-1 right-1 bg-background border max-w-xl mx-auto rounded-lg">
    {#if $replyingTo}
        <div class="px-2.5 flex items-center justify-between border-b">
            <p class="text-xs text-muted-foreground">
                Replying to <span class="text-primary">@{$replyingTo.username}</span>
            </p>
            <Button variant="ghost" size="icon" class="h-7 w-7" on:click={clearReply}>
                <X class="h-3.5 w-3.5" strokeWidth={2.5} />
            </Button>
        </div>
    {/if}
   
    <div class="flex items-center">
        <textarea
            bind:value={newComment}
            bind:this={textareaElement}
            on:input={adjustHeight}
            placeholder={$replyingTo ? `wanna yap back to ${$replyingTo.username}?` : "wanna yap back?"}
            class={cn(
                "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                "border-none resize-none leading-normal focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:border-none focus-visible:border-none focus:outline-none focus-visible:outline-none"
            )}
            style="min-height: 38px; max-height: 96px;"
        ></textarea>
        <Button variant="ghost" size="icon" class="min-h-6 min-w-6" on:click={handleSubmitComment}>
            <Send class="h-3.5 w-3.5" strokeWidth={2.5} />
        </Button>
    </div>
</div>