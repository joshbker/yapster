<script>
    import { ChevronLeft } from 'lucide-svelte';
    import { Button } from '$lib/component/ui/button';

    export let name = "";
    export let back = () => window.history.back();
    export let submit = undefined;
    export let disabled = false;
</script>

<div class="relative flex items-center justify-center h-10">
    <Button variant="ghost" class="absolute left-0 px-2 h-7" on:click={back}>
        <ChevronLeft class="h-5 w-5" />
    </Button>
    <h1 class="text-sm font-semibold">{name}</h1>
    {#if submit}
        <Button 
            variant="ghost" 
            class="absolute right-2 px-2 h-7 text-primary" 
            on:click={submit}
            {disabled}
        >
            Save
        </Button>
    {/if}
</div>