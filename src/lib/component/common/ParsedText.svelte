<script>
    import { parseTextContent } from "$lib/util";
    import * as HoverCard from "$lib/component/ui/hover-card/index.js";
    import ProfileCard from "$lib/component/profile/ProfileCard.svelte";
    import { getUserByUsername } from "$lib/util";
    import { Button } from "$lib/component/ui/button";

    export let text;
    export let viewer;
    
    let mentionedUsers = new Map();

    async function fetchUserData(username) {
        if (!mentionedUsers.has(username)) {
            const userData = await getUserByUsername(username);
            mentionedUsers.set(username, userData);
        }
        return mentionedUsers.get(username);
    }
</script>

<span class="whitespace-pre-wrap break-words">{#each parseTextContent(text) as part}{#if part.type === 'mention'}{#await fetchUserData(part.username)}<Button variant="secondary" size="xs" class="text-primary/90 bg-primary/10 px-1.5 py-0.5"><p>{part.content}</p></Button>{:then userData}{#if userData}<HoverCard.Root><HoverCard.Trigger class="inline-block"><Button variant="secondary" size="xs" href={`/@${part.username}`} data-sveltekit-preload-data="off" class="text-primary/90 bg-primary/10 hover:text-primary hover:bg-primary/20 transition-colors px-1.5 py-0.5"><p>{part.content}</p></Button></HoverCard.Trigger><HoverCard.Content class="w-80"><ProfileCard user={userData} {viewer} /></HoverCard.Content></HoverCard.Root>{:else}<Button variant="secondary" size="xs" class="text-muted-foreground/90 bg-foreground/10 px-1.5 py-0.5"><p>{part.content}</p></Button>{/if}{:catch}<Button variant="secondary" size="xs" class="text-muted-foreground/90 bg-foreground/10 px-1.5 py-0.5"><p>{part.content}</p></Button>{/await}{:else if part.type === 'link'}<a href={part.url} target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 transition-colors">{part.content}</a>{:else if part.type === 'hashtag'}<Button variant="secondary" size="xs" href={`/tag/${part.tag}`} class="text-foreground bg-foreground/10 px-1.5 py-0.5"><p>{part.content}</p></Button>{:else}{part.content}{/if}{/each}</span> 