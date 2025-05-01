<script>
    import { getTimeAgo } from "$lib/util";
    import { PUBLIC_DEFAULT_AVATAR_URL } from "$env/static/public";
    import * as HoverCard from "$lib/component/ui/hover-card/index.js";
    import ProfileCard from "$lib/component/profile/ProfileCard.svelte";
    import BadgeVerified from "$lib/component/profile/BadgeVerified.svelte";
    import { getUserById } from "$lib/util";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import CommentActions from "./CommentActions.svelte";
    import ParsedText from "$lib/component/common/ParsedText.svelte";
    
    export let comment;
    export let viewer;

    const authorData = writable(null);

    onMount(async () => {
        try {
            const userData = await getUserById(comment.author);
            authorData.set(userData);
        } catch (err) {
            console.error('Failed to fetch author data:', err);
        }
    });
</script>

<div class="rounded-lg p-3">
    <div class="flex items-start gap-2 flex-col w-full justify-between">
        <div class="flex items-start justify-between w-full">
            <div class="flex items-start gap-2 min-w-0 flex-1">
                <HoverCard.Root>
                    <HoverCard.Trigger
                        href={$authorData ? `/@${$authorData.username}` : '#'}
                        data-sveltekit-preload-data="off"
                        class="flex-shrink-0"
                    >
                        <img 
                            src={$authorData?.image ?? PUBLIC_DEFAULT_AVATAR_URL} 
                            alt={`${$authorData?.name ?? $authorData?.username ?? 'User'}'s avatar`}
                            class="w-8 h-8 rounded-full object-cover bg-background flex-shrink-0"
                        />
                    </HoverCard.Trigger>
                    <HoverCard.Content class="w-80">
                        {#if $authorData}
                            <ProfileCard user={$authorData} {viewer} />
                        {/if}
                    </HoverCard.Content>
                </HoverCard.Root>

                <div class="flex flex-col min-w-0 flex-1">
                    <div class="flex items-start justify-between w-full gap-4">
                        <HoverCard.Root>
                            <HoverCard.Trigger
                                href={$authorData ? `/@${$authorData.username}` : '#'}
                                data-sveltekit-preload-data="off"
                            >
                                <div class="flex items-center gap-2">
                                    <div class="flex items-center gap-1.5">
                                        <span class="font-semibold text-sm">{$authorData?.name ?? $authorData?.username ?? 'User'}</span>
                                        {#if $authorData?.verified}
                                            <BadgeVerified size={14} />
                                        {/if}
                                    </div>
                                    {#if $authorData?.name}
                                        <p class="text-xs font-medium text-muted-foreground">{$authorData.username}</p>
                                    {/if}
                                </div>
                            </HoverCard.Trigger>
                            <HoverCard.Content class="w-80">
                                {#if $authorData}
                                    <ProfileCard user={$authorData} {viewer} />
                                {/if}
                            </HoverCard.Content>
                        </HoverCard.Root>
                        <span class="text-xs text-muted-foreground flex-shrink-0">
                            {getTimeAgo(new Date(comment.timestamp))}
                        </span>
                    </div>
                    <p class="text-sm mt-1">
                        <ParsedText text={comment.text} {viewer} />
                    </p>
                </div>
            </div>
        </div>

        <CommentActions {comment} {viewer} />
    </div>
</div> 