<script>
	import { Calendar as CalendarPrimitive } from "bits-ui"
	import { cn } from "$lib/util.js"
	export let date
	let className = undefined
	export { className as class }
</script>

<CalendarPrimitive.Cell
	{date}
	class={cn(
		"[&:has([data-selected])]:bg-accent [&:has([data-selected][data-outside-month])]:bg-accent/50 relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:rounded-md",
		className
	)}
	{...$$restProps}
>
	<slot />
</CalendarPrimitive.Cell>
