<script>
	import { Dialog as SheetPrimitive } from "bits-ui"
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
</script>

<SheetPrimitive.Portal class={cn(className)} {...$$restProps}>
	<slot />
</SheetPrimitive.Portal>
