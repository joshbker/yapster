<script>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui"
	import ChevronRight from "lucide-svelte/icons/chevron-right"
	import { cn } from "$lib/util.js"
	let className = undefined
	export let inset = undefined
	export { className as class }
</script>

<DropdownMenuPrimitive.SubTrigger
	class={cn(
		"data-[highlighted]:bg-accent data-[state=open]:bg-accent data-[highlighted]:text-accent-foreground data-[state=open]:text-accent-foreground flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
		inset && "pl-8",
		className
	)}
	{...$$restProps}
	on:click
	on:keydown
	on:focusin
	on:focusout
	on:pointerleave
	on:pointermove
>
	<slot />
	<ChevronRight class="ml-auto h-4 w-4" />
</DropdownMenuPrimitive.SubTrigger>
