<script>
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
</script>

<tfoot class={cn("bg-primary text-primary-foreground font-medium", className)} {...$$restProps}>
	<slot />
</tfoot>
