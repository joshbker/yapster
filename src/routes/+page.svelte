<script>
	import AccountLogIn from '$lib/component/page/AccountLogIn.svelte';
	import { Button } from '$lib/component/ui/button';
	import { 
        Bell, 
        Send, 
    } from "lucide-svelte"

	export let data;
</script>

{#if data.user}
	<div class="container mx-auto px-4">
		<div class="flex h-12 items-center justify-between">
			<div class="flex items-center gap-3 text-sm">
				<Button variant="ghost" class="p-0">For you</Button>
				<Button variant="ghost" class="p-0">Following</Button>
			</div>

			<!-- Navigation Items -->
			<div class="flex items-center gap-3">
				<Button variant="ghost" href="/account/notifications" class="p-0">
					<Bell class="h-5 w-5" />
					<span class="sr-only">Notifications</span>
				</Button>
				<Button variant="ghost" href="/account/messages" class="p-0">
					<Send class="h-5 w-5" />
					<span class="sr-only">Messages</span>
				</Button>
			</div>
		</div>
	</div>
	<div class="container p-0">
		<h1>feed goes here</h1>
	</div>
{:else}
	<AccountLogIn />
{/if}