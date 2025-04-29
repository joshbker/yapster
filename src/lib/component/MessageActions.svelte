<script>
    import { page } from "$app/stores"
    import { Button } from "$lib/component/ui/button"
    import { MessageSquare } from "lucide-svelte"

    export let user;
    export let viewer;
</script>

<Button variant="outline" class="px-2 h-8 flex items-center gap-1.5" on:click={(e) => {
    e.preventDefault();
    e.stopPropagation();
    alert("Message");
}}>
    <MessageSquare class="h-4 w-4" />
    <p class="hidden lg:block">Message</p>
</Button>