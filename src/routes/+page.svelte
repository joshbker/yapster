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
	<div class="container px-2">
		<div class="flex h-12 items-center justify-between">
			<div class="flex items-center text-sm">
				<Button variant="ghost" class="px-2">For you</Button>
				<Button variant="ghost" class="px-2">Following</Button>
			</div>

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
		<h1>feed goes here</h1>
	</div>
{:else}
	<AccountLogIn />
{/if}