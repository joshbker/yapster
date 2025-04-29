<script>
    import { getTimeAgo } from "$lib/util";
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public";
    import BadgeVerified from "$lib/component/BadgeVerified.svelte";
    import { Heart, MessageCircle, Bookmark, Forward } from "lucide-svelte";
    import { Button } from "$lib/component/ui/button";
    import Carousel from 'svelte-carousel';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    export let post;
    export let author;
    export let viewer;

    let currentPageIndex = 0;
    let showCounter = false;
    let counterTimeout;

    function showCounterTemporarily() {
        showCounter = true;
        if (counterTimeout) clearTimeout(counterTimeout);
        counterTimeout = setTimeout(() => {
            showCounter = false;
        }, 3000);
    }

    onMount(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && post.content.items.length > 1) {
                    showCounterTemporarily();
                }
            });
        });

        const carousel = document.getElementById(`carousel-${post.id}`);
        if (carousel) {
            observer.observe(carousel);
        }

        return () => {
            if (counterTimeout) clearTimeout(counterTimeout);
            observer.disconnect();
        };
    });
</script>


<div class="rounded-lg p-4 relative overflow-hidden">
    {#if post.content.items?.length}
        <div 
            class="absolute inset-0 bg-cover bg-center -z-10"
            style="background-image: url('{post.content.items[0]}'); filter: blur(16px); transform: scale(1.1);"
        />
        <div class="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.6)_0%,transparent_50%,rgba(0,0,0,0.6)_100%)] -z-10" />
    {/if}
    
    <div class="flex items-start gap-3 flex-col">
        <div class="flex items-start justify-between w-full">
            <div class="flex items-start gap-2">
                <img src={author.image ?? PUBLIC_DEFAULT_AVATAR_URL} alt="Avatar" class="w-10 h-10 rounded-full object-cover" />
                <div class="flex flex-col">
                    <div class="flex items-center gap-2.5">
                        <div class="flex items-center gap-1.5">
                            <span class="font-semibold">{author.name ?? author.username}</span>
                            {#if author.verified}
                                <BadgeVerified size={16} />
                            {/if}
                        </div>
                        {#if author.name}
                            <p class="text-sm font-medium text-muted-foreground">{author.username}</p>
                        {/if}
                    </div>
                    {#if post.content.text}
                        <p class="whitespace-pre-wrap text-sm">{post.content.text}</p>
                    {/if}
                </div>
            </div>
            <span class="text-muted-foreground text-sm">{getTimeAgo(new Date(post.timestamp))}</span>
        </div>
        
        {#if post.content.items?.length}
            <div class="w-full">
                <Carousel
                    particlesToShow={1}
                    particlesToScroll={1}
                    autoplay={false}
                    arrows={false}
                    dots={false}
                    on:pageChange={(e) => currentPageIndex = e.detail}
                >
                    {#each post.content.items as item}
                        <div 
                            id="carousel-{post.id}"
                            class="w-full aspect-square relative"
                            on:mouseenter={showCounterTemporarily}
                            on:touchstart={showCounterTemporarily}
                            role="button"
                            tabindex="0"
                        >
                            <img 
                                src={item} 
                                alt="Post media" 
                                class="absolute inset-0 w-full h-full rounded-lg object-cover"
                                draggable="false"
                            >
                            {#if post.content.items.length > 1 && showCounter}
                                <div 
                                    class="absolute top-2 right-2 bg-black/50 opacity-70 px-2 py-1 rounded-xl text-white text-xs"
                                    transition:fade
                                >
                                    {currentPageIndex + 1}/{post.content.items.length}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </Carousel>
            </div>
        {/if}

        <div class="flex w-full justify-between">
            <div class="flex items-center gap-1 -ml-1.5">
                <Button variant="ghost" size="sm" class="flex items-center gap-2 h-8 px-2 hover:!text-red-500">
                    <Heart class="h-5 w-5" />
                    <span>{post.likes?.length ?? 0}</span>
                </Button>
                <Button variant="ghost" size="sm" class="flex items-center gap-2 h-8 px-2 hover:!text-blue-500">
                    <MessageCircle class="h-5 w-5" />
                    <span>{post.comments?.length ?? 0}</span>
                </Button>
                <Button variant="ghost" size="sm" class="flex items-center gap-2 h-8 px-2 hover:!text-green-500">
                    <Forward class="h-5 w-5" />
                    <span>{post.shares ?? 0}</span>
                </Button>
            </div>
            <Button variant="ghost" size="sm" class="flex items-center gap-2 h-8 px-2 hover:!text-yellow-500">
                <Bookmark class="h-5 w-5" />
                <span>{post.saves?.length ?? 0}</span>
            </Button>
        </div>
    </div>
</div>