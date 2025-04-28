<script>
	import { Calendar as CalendarPrimitive } from "bits-ui"
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
</script>

<CalendarPrimitive.GridHead class={cn(className)} {...$$restProps}>
	<slot />
</CalendarPrimitive.GridHead>
