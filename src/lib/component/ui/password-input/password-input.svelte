<script>
	let className = undefined
	export let value = undefined
	export { className as class }

	import { Input } from '$lib/component/ui/input';
	import EyeIcon from 'lucide-svelte/icons/eye';
	import EyeOffIcon from 'lucide-svelte/icons/eye-off';
	import { writable } from 'svelte/store';

	const showPassword = writable(false);

    export let placeholder = "Password";
</script>

<div class="relative">
    <Input 
        type={$showPassword ? 'text' : 'password'} 
        placeholder={placeholder} 
        class="rounded-lg text-foreground border-border pr-10 {className}" 
        bind:value
		required
    />
    <button 
        type="button"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
        on:click={() => showPassword.update(value => !value)}
    >
        {#if $showPassword}
            <EyeOffIcon class="h-4 w-4" />
        {:else}
            <EyeIcon class="h-4 w-4" />
        {/if}
    </button>
</div>