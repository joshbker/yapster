<script>
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
</script>

<div
	class={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
	{...$$restProps}
>
	<slot />
</div>