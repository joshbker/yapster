<script>
	import { cn } from "$lib/util.js";
	import { createEventDispatcher } from "svelte";
	
	const dispatch = createEventDispatcher();
	
	/**
	 * @type {string}
	 */
	export let className = undefined;
	
	/**
	 * @type {boolean}
	 */
	export let checked = false;
	
	/**
	 * @type {boolean}
	 */
	export let disabled = false;
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	data-state={checked ? "checked" : "unchecked"}
	disabled={disabled}
	class={cn(
		"inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
		checked ? "bg-primary" : "bg-input",
		className
	)}
	on:click={() => {
		if (!disabled) {
			checked = !checked;
			dispatch("change", { checked });
		}
	}}
	{...$$restProps}
>
	<span
		aria-hidden="true"
		class={cn(
			"pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
			checked ? "translate-x-5" : "translate-x-0"
		)}
	/>
</button> 