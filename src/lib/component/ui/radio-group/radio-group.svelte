<script>
	import { RadioGroup as RadioGroupPrimitive } from "bits-ui"
	import { cn } from "$lib/util.js"
	let className = undefined
	export let value = undefined
	export { className as class }
</script>

<RadioGroupPrimitive.Root bind:value class={cn("grid gap-2", className)} {...$$restProps}>
	<slot />
</RadioGroupPrimitive.Root>
