<script>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui"
	import { fade } from "svelte/transition"
	import { cn } from "$lib/util.js"
	let className = undefined
	export let transition = fade
	export let transitionConfig = {
		duration: 150,
	}
	export { className as class }
</script>

<AlertDialogPrimitive.Overlay
	{transition}
	{transitionConfig}
	class={cn("bg-background/80 fixed inset-0 z-50 backdrop-blur-sm ", className)}
	{...$$restProps}
/>
