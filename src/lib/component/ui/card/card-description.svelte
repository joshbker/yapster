<script>
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
</script>

<p class={cn("text-sm text-muted-foreground", className)} {...$$restProps}>
	<slot />
</p>