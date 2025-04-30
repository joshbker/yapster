<script>
    import { getTimeAgo } from "$lib/util";
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public";
    import BadgeVerified from "$lib/component/BadgeVerified.svelte";
    import { Heart, MessageCircle, Bookmark, Forward } from "lucide-svelte";
    import { Button } from "$lib/component/ui/button";
    import Carousel from 'svelte-carousel';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import MediaItem from './MediaItem.svelte';

    export let post;
    export let author;
    export let viewer;

    let currentPageIndex = 0;
    let showCounter = false;
    let counterTimeout;
    let isSwiping = false;

    function isVideo(url) {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        const urlLower = url.toLowerCase();
        return videoExtensions.some(ext => urlLower.endsWith(ext));
    }

    function showCounterTemporarily() {
        showCounter = true;
        if (counterTimeout) clearTimeout(counterTimeout);
        counterTimeout = setTimeout(() => {
            showCounter = false;
        }, 3000);
    }

    function handleTouchStart() {
        isSwiping = true;
    }

    function handleTouchEnd() {
        isSwiping = false;
    }

    function handleTouchMove(e) {
        if (isSwiping) {
            e.preventDefault();
        }
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
        {#if isVideo(post.content.items[currentPageIndex])}
            <video 
                src={post.content.items[currentPageIndex]}
                class="absolute inset-0 -z-10 w-full h-full object-cover scale-110"
                style="filter: blur(16px);"
                muted
                loop
                playsinline
                autoplay
            />
        {:else}
            <div 
                class="absolute inset-0 bg-cover bg-center -z-10 scale-110"
                style="background-image: url('{post.content.items[currentPageIndex]}'); filter: blur(16px);"
            />
        {/if}
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
                {#if post.content.items.length > 1}
                    <Carousel
                        particlesToShow={1}
                        particlesToScroll={1}
                        autoplay={false}
                        arrows={false}
                        dots={false}
                        infinite={false}
                        on:pageChange={(e) => currentPageIndex = e.detail}
                    >
                        {#each post.content.items as item}
                            <div 
                                id="carousel-{post.id}"
                                class="w-full aspect-square relative"
                                role="presentation"
                                on:mouseenter={showCounterTemporarily}
                                on:touchstart={(e) => { showCounterTemporarily(); handleTouchStart(); }}
                                on:touchend={handleTouchEnd}
                                on:touchmove|preventDefault={handleTouchMove}
                            >
                                <MediaItem 
                                    {item} 
                                    isVideo={isVideo(item)}
                                />
                                {#if showCounter}
                                    <div class="absolute top-2 right-2 bg-black/50 opacity-70 px-2 py-1 rounded-xl text-white text-xs" transition:fade>
                                        {currentPageIndex + 1}/{post.content.items.length}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </Carousel>
                {:else}
                    <div class="w-full aspect-square relative">
                        <MediaItem 
                            item={post.content.items[0]} 
                            isVideo={isVideo(post.content.items[0])}
                        />
                    </div>
                {/if}
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