<script>
	import { Calendar as CalendarPrimitive } from "bits-ui"
	import ChevronRight from "lucide-svelte/icons/chevron-right"
	import { buttonVariants } from "$lib/component/ui/button/index.js"
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
</script>

<CalendarPrimitive.NextButton
	on:click
	class={cn(
		buttonVariants({ variant: "outline" }),
		"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
		className
	)}
	{...$$restProps}
	let:builder
>
	<slot {builder}>
		<ChevronRight class="h-4 w-4" />
	</slot>
</CalendarPrimitive.NextButton>
