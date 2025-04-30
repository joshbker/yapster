<script>
	import Feed from '$lib/component/page/Feed.svelte';
	import { page } from '$app/stores';

	$: user = $page.data.user;
	$: posts = $page.data.posts;
</script>

<Feed {user} {posts} />