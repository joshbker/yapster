<script>
	import Feed from '$lib/component/page/Feed.svelte';
	import AccountLogIn from '$lib/component/page/AccountLogIn.svelte';
	import { page } from '$app/stores';
</script>

{#if $page.data.user}
	<Feed user={$page.data.user} posts={$page.data.posts} />
{:else}
	<AccountLogIn />
{/if}