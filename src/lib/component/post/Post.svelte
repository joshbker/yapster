<script>
    import { getTimeAgo } from "$lib/util";
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public";
    import BadgeVerified from "$lib/component/profile/BadgeVerified.svelte";
    import Carousel from 'svelte-carousel';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import MediaItem from '$lib/component/post/MediaItem.svelte';
    import PostActions from '$lib/component/post/PostActions.svelte';
    import { Circle, MapPin, Hash } from "lucide-svelte";
    import { Button } from "$lib/component/ui/button";
    import * as HoverCard from "$lib/component/ui/hover-card/index.js";
    import ProfileCard from "$lib/component/profile/ProfileCard.svelte";
    import { getUserByUsername } from "$lib/util";

    export let post;
    export let author;
    export let viewer;

    let currentPageIndex = 0;
    let showCounter = false;
    let counterTimeout;
    let isSwiping = false;
    let mentionedUsers = new Map();

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

    function parseMentions(text) {
        const parts = [];
        let lastIndex = 0;
        const mentionRegex = /@(\w+)/g;
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            // Add text before the mention
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.slice(lastIndex, match.index)
                });
            }

            // Add the mention
            parts.push({
                type: 'mention',
                username: match[1],
                content: match[0]
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text after last mention
        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex)
            });
        }

        // Clean up whitespace between parts
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].type === 'text') {
                // Preserve newlines but clean up extra spaces around mentions
                parts[i].content = parts[i].content.replace(/\s+/g, (match) => {
                    return match.includes('\n') ? match : ' ';
                });
                
                // Remove space before mention if it's at the start
                if (i === 0) {
                    parts[i].content = parts[i].content.trimStart();
                }
                // Remove space after mention if it's at the end
                if (i === parts.length - 1) {
                    parts[i].content = parts[i].content.trimEnd();
                }
            }
        }

        return parts;
    }

    async function fetchUserData(username) {
        if (!mentionedUsers.has(username)) {
            try {
                const userData = await getUserByUsername(username);
                mentionedUsers.set(username, userData);
            } catch (error) {
                console.error('Error fetching user data:', error);
                mentionedUsers.set(username, null);
            }
        }
        return mentionedUsers.get(username);
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
                        <p class="whitespace-pre-wrap text-sm break-words">{#each parseMentions(post.content.text) as part}{#if part.type === 'mention'}{#await fetchUserData(part.username)}<span class="text-primary">{part.content}</span>{:then userData}{#if userData}<HoverCard.Root><HoverCard.Trigger href={`/@${part.username}`} data-sveltekit-preload-data="off" class="text-primary hover:text-primary/80 transition-colors">{part.content}</HoverCard.Trigger><HoverCard.Content class="w-80"><ProfileCard user={userData} {viewer} /></HoverCard.Content></HoverCard.Root>{:else}<span class="text-muted-foreground">{part.content}</span>{/if}{:catch}<span class="text-muted-foreground">{part.content}</span>{/await}{:else}{part.content}{/if}{/each}</p>
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

        <PostActions {post} {viewer} />

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