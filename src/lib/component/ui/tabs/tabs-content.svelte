<script>
	import { Tabs as TabsPrimitive } from "bits-ui"
	import { cn } from "$lib/util.js"
	let className = undefined
	export let value
	export { className as class }
</script>

<TabsPrimitive.Content
	class={cn(
		"ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
		className
	)}
	{value}
	{...$$restProps}
>
	<slot />
</TabsPrimitive.Content>
