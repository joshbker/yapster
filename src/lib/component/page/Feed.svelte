<script>
    import { Button } from '$lib/component/ui/button';
    import { Bell, Send, Compass } from "lucide-svelte"
    import PostList from '$lib/component/post/PostList.svelte';
    import * as Tabs from "$lib/component/ui/tabs";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { browser } from '$app/environment';
    import { feedTab } from '$lib/data/feedStore';

    export let user;
    export let posts;

    $: currentTab = $page.url.pathname === "/following" ? "following" : "for-you";

    // Update feedTab when URL changes
    $: if (browser) {
        feedTab.set(currentTab);
    }

    function handleTabClick(value) {
        if (browser) {
            const href = value === "following" ? "/following" : "/";
            goto(href);
        }
    }
</script>

<div class="container px-2">
    <div class="flex h-12 items-center justify-between">
        <Tabs.Root value={currentTab} onValueChange={handleTabClick}>
            <Tabs.List class="bg-transparent">
                <Tabs.Trigger value="for-you" class="data-[state=active]:bg-muted data-[state=active]:font-bold">
                    For you
                </Tabs.Trigger>
                <Tabs.Trigger value="following" class="data-[state=active]:bg-muted data-[state=active]:font-bold">
                    Following
                </Tabs.Trigger>
            </Tabs.List>
        </Tabs.Root>

        <!-- Navigation Items -->
        <div class="flex items-center">
            <Button variant="ghost" size="icon" href="/account/notifications" >
                <Bell class="h-5 w-5" />
                <span class="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" href="/account/messages">
                <Send class="h-5 w-5" />
                <span class="sr-only">Messages</span>
            </Button>
        </div>	
    </div>
</div>
<div class="container p-0">
    {#if posts.length}
        <PostList postIds={posts} viewer={user} />
    {:else}
        <div class="container px-2 w-full flex flex-col items-center mt-16 gap-4">
            <p class="text-sm text-muted-foreground">You obviously don't follow any yappers...</p>
            <Button href="/explore" class="flex items-center gap-2">
                <Compass class="h-4 w-4 -mb-0.5" />
                Discover people to follow
            </Button>
        </div>
    {/if}
</div>