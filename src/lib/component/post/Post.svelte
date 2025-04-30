{post.content.text}
<script>
    import { getTimeAgo } from "$lib/util";
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public";
    import BadgeVerified from "$lib/component/BadgeVerified.svelte";
    import { Heart, MessageCircle, Bookmark, Forward } from "lucide-svelte";
    import { Button } from "$lib/component/ui/button";
    import Carousel from 'svelte-carousel';
    import { onMount } from 'svelte';
    import { fade, crossfade, fade as fadeTransition } from 'svelte/transition';
    import MediaItem from './MediaItem.svelte';
    import { tweened } from 'svelte/motion';

    export let post;
    export let author;
    export let viewer;

    let currentPageIndex = 0;
    let showCounter = false;
    let counterTimeout;
    let isSwiping = false;
    let isFullscreen = false;
    let videoThumbnails = new Map();
    let currentThumbnail = '';
    let nextThumbnail = '';
    let showingFirst = true;
    let backgroundInterval;
    let tempVideo;
    let activeVideoElement = null;

    const [send, receive] = crossfade({
        duration: 1000,
        fallback: fadeTransition,
        easing: (t) => t * t * (3 - 2 * t)
    });

    let fadeOpacity = tweened(0, {
        duration: 2000,
        easing: (t) => t * t * (3 - 2 * t)
    });

    async function getVideoThumbnail(videoUrl, time = 0) {
        const cacheKey = `${videoUrl}-${time}`;
        if (videoThumbnails.has(cacheKey)) {
            return videoThumbnails.get(cacheKey);
        }

        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = videoUrl;
            
            const handleLoad = () => {
                video.currentTime = time;
            };

            const handleSeeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumbnailUrl = canvas.toDataURL();
                videoThumbnails.set(cacheKey, thumbnailUrl);
                video.removeEventListener('loadeddata', handleLoad);
                video.removeEventListener('seeked', handleSeeked);
                resolve(thumbnailUrl);
            };

            video.addEventListener('loadeddata', handleLoad);
            video.addEventListener('seeked', handleSeeked);
            video.addEventListener('error', () => {
                video.removeEventListener('loadeddata', handleLoad);
                video.removeEventListener('seeked', handleSeeked);
                resolve('');
            });
        });
    }

    async function updateBackgroundFromCurrentFrame() {
        if (!activeVideoElement?.videoElement) return;
        
        const video = activeVideoElement.videoElement;
        const videoUrl = video.src;
        const currentTime = video.currentTime;
        
        try {
            const newThumbnail = await getVideoThumbnail(videoUrl, currentTime);
            if (newThumbnail) {
                if (showingFirst) {
                    nextThumbnail = newThumbnail;
                    await fadeOpacity.set(1, { duration: 2000 });
                } else {
                    currentThumbnail = newThumbnail;
                    await fadeOpacity.set(0, { duration: 2000 });
                }
                showingFirst = !showingFirst;
            }
        } catch (error) {
            console.error('Error updating background from current frame:', error);
        }
    }

    async function startBackgroundCycle(videoUrl) {
        try {
            cleanup();

            // Initialize first thumbnail
            currentThumbnail = await getVideoThumbnail(videoUrl, 0);
            nextThumbnail = await getVideoThumbnail(videoUrl, 5);
            fadeOpacity.set(0, { duration: 0 });
            showingFirst = true;

            // Start the cycle
            backgroundInterval = setInterval(updateBackgroundFromCurrentFrame, 5000);
        } catch (error) {
            console.error('Error starting background cycle:', error);
            if (!currentThumbnail && !nextThumbnail) {
                currentThumbnail = '';
                nextThumbnail = '';
            }
        }
    }

    function handleVideoMount(event) {
        activeVideoElement = event.detail;
        if (isVideo(post.content.items[currentPageIndex])) {
            startBackgroundCycle(post.content.items[currentPageIndex]);
        }
    }

    // Clean up function
    function cleanup() {
        if (backgroundInterval) {
            clearInterval(backgroundInterval);
            backgroundInterval = null;
        }
        if (tempVideo) {
            tempVideo.pause();
            tempVideo.removeAttribute('src');
            tempVideo.load();
            tempVideo = null;
        }
        videoThumbnails.clear();
        currentThumbnail = '';
        nextThumbnail = '';
    }

    // Update background cycle when page changes
    $: {
        if (post.content.items?.[currentPageIndex]) {
            cleanup();
            if (isVideo(post.content.items[currentPageIndex]) && activeVideoElement) {
                startBackgroundCycle(post.content.items[currentPageIndex]);
            }
        }
    }

    // Load volume settings from localStorage
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

        const handleFullscreenChange = () => {
            isFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement
            );
        };
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            if (counterTimeout) clearTimeout(counterTimeout);
            cleanup();
            observer.disconnect();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    });

    function isVideo(url) {
        // Check common video extensions
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
</script>

<div class="rounded-lg p-4 relative overflow-hidden">
    {#if post.content.items?.length}
        {#if isVideo(post.content.items[currentPageIndex])}
            {#if currentThumbnail}
                <div class="absolute inset-0 -z-10">
                    <div 
                        class="absolute inset-0 bg-cover bg-center"
                        style="background-image: url('{currentThumbnail}'); filter: blur(16px); transform: scale(1.1);"
                    />
                    <div 
                        class="absolute inset-0 bg-cover bg-center"
                        style="background-image: url('{nextThumbnail}'); filter: blur(16px); transform: scale(1.1); opacity: {$fadeOpacity};"
                    />
                </div>
            {:else}
                <div class="absolute inset-0 bg-black/50 -z-10" />
            {/if}
        {:else}
            <div 
                class="absolute inset-0 bg-cover bg-center -z-10"
                style="background-image: url('{post.content.items[currentPageIndex]}'); filter: blur(16px); transform: scale(1.1);"
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
                                    on:videoMount={handleVideoMount}
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
                            on:videoMount={handleVideoMount}
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