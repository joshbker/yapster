<script>
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
</script>

<caption class={cn("text-muted-foreground mt-4 text-sm", className)} {...$$restProps}>
	<slot />
</caption>
