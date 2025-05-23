<script>
    import { getTimeAgo } from "$lib/util";
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public";
    import BadgeVerified from "$lib/component/profile/BadgeVerified.svelte";
    import Carousel from 'svelte-carousel';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import MediaItem from '$lib/component/post/MediaItem.svelte';
    import PostActions from '$lib/component/post/PostActions.svelte';
    import { MapPin, Hash } from "lucide-svelte";
    import { Button } from "$lib/component/ui/button";
    import * as HoverCard from "$lib/component/ui/hover-card/index.js";
    import ProfileCard from "$lib/component/profile/ProfileCard.svelte";
    import ParsedText from "$lib/component/common/ParsedText.svelte";
    import { deletedPosts } from "$lib/data/deleteStore";

    export let post;
    export let author;
    export let viewer;

    let currentPageIndex = 0;
    let showCounter = false;
    let counterTimeout;
    let isSwiping = false;
    let isDeleted = false;

    // Subscribe to deleted posts store
    $: {
        if ($deletedPosts.has(post.id)) {
            isDeleted = true;
        }
    }

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

{#if isDeleted}
    <div 
        class="rounded-lg p-4 relative overflow-hidden bg-muted/50" 
        data-post-id={post.id}
        transition:fade
    >
        <div class="flex items-center justify-center text-muted-foreground">
            <p class="text-sm">This post has been deleted.</p>
        </div>
    </div>
{:else}
    <div 
        class="rounded-lg p-4 relative overflow-hidden {post.content.items?.length ? 'mb-4' : ''}" 
        data-post-id={post.id}
        transition:fade
    >
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
                <div class="flex items-start gap-2 min-w-0 flex-1">
                    <HoverCard.Root>
                        <HoverCard.Trigger
                            href={`/@${author.username}`}
                            data-sveltekit-preload-data="off"
                            class="flex-shrink-0"
                        >
                            <img src={author.image ?? PUBLIC_DEFAULT_AVATAR_URL} alt="Avatar" class="w-10 h-10 rounded-full object-cover bg-background" />
                        </HoverCard.Trigger>
                        <HoverCard.Content class="w-80">
                            <ProfileCard user={author} viewer={viewer} />
                        </HoverCard.Content>
                    </HoverCard.Root>
                    <div class="flex flex-col min-w-0 flex-1">
                        <div class="flex items-start justify-between w-full gap-4">
                            <HoverCard.Root>
                                <HoverCard.Trigger
                                    href={`/@${author.username}`}
                                    data-sveltekit-preload-data="off"
                                >
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
                                </HoverCard.Trigger>
                                <HoverCard.Content class="w-80">
                                    <ProfileCard user={author} viewer={viewer} />
                                </HoverCard.Content>
                            </HoverCard.Root>
                            <div class="flex items-center gap-2 flex-shrink-0">

                                <p class="text-muted-foreground text-sm">{getTimeAgo(new Date(post.timestamp))}</p>
                            </div>
                        </div>
                        {#if post.content.text}
                            <p class="text-sm">
                                <ParsedText text={post.content.text} {viewer} />
                            </p>
                        {/if}
                    </div>
                </div>
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

            <PostActions {post} {author} {viewer} />

            <div class="flex items-center justify-between gap-2 w-full">
                <div class="flex items-center gap-1.5">
                    {#if post.content.tags?.length}
                        <Hash class="h-4 w-4" />
                        <div class="flex flex-wrap gap-1.5">
                            {#each post.content.tags as tag}
                                <Button variant="secondary" size="xs" class="text-foreground bg-foreground/10 px-2 py-1">
                                    <p class="text-xs">{tag}</p>
                                </Button>
                            {/each}
                        </div>
                    {/if}
                </div>

                <div class="flex items-center gap-1.5">
                    {#if post.content.location}
                        <Button variant="secondary" size="xs" class="text-foreground bg-foreground/10 px-2 py-1">
                            <p class="text-xs">{post.content.location}</p>
                        </Button>
                        <MapPin class="h-4 w-4" />
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if} 