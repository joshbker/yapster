<script>
	import { Separator as SeparatorPrimitive } from "bits-ui"
	import { cn } from "$lib/util.js"
	let className = undefined
	export let orientation = "horizontal"
	export let decorative = undefined
	export { className as class }
</script>

<SeparatorPrimitive.Root
	class={cn(
		"bg-border shrink-0",
		orientation === "horizontal" ? "h-[1px] w-full" : "min-h-full w-[1px]",
		className
	)}
	{orientation}
	{decorative}
	{...$$restProps}
/>
