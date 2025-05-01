<script>
    import { parseTextContent } from "$lib/util";
    import * as HoverCard from "$lib/component/ui/hover-card/index.js";
    import ProfileCard from "$lib/component/profile/ProfileCard.svelte";
    import { getUserByUsername } from "$lib/util";

    export let text;
    export let viewer;
    
    let mentionedUsers = new Map();

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
</script>

<span class="whitespace-pre-wrap break-words">{#each parseTextContent(text) as part}{#if part.type === 'mention'}{#await fetchUserData(part.username)}<span class="text-primary">{part.content}</span>{:then userData}{#if userData}<HoverCard.Root><HoverCard.Trigger href={`/@${part.username}`} data-sveltekit-preload-data="off" class="text-primary hover:text-primary/80 transition-colors">{part.content}</HoverCard.Trigger><HoverCard.Content class="w-80"><ProfileCard user={userData} {viewer} /></HoverCard.Content></HoverCard.Root>{:else}<span class="text-muted-foreground">{part.content}</span>{/if}{:catch}<span class="text-muted-foreground">{part.content}</span>{/await}{:else if part.type === 'link'}<a href={part.url} target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 transition-colors">{part.content}</a>{:else}{part.content}{/if}{/each}</span> 