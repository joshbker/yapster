<script>
	import { Tabs as TabsPrimitive } from "bits-ui"
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
</script>

<TabsPrimitive.List
	class={cn(
		"bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1",
		className
	)}
	{...$$restProps}
>
	<slot />
</TabsPrimitive.List>
