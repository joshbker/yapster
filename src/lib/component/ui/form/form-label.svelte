<script>
	import { getFormControl } from "formsnap"
	import { cn } from "$lib/util.js"
	import { Label } from "$lib/component/ui/label/index.js"
	let className = undefined
	export { className as class }
	const { labelAttrs } = getFormControl()
</script>

<Label {...$labelAttrs} class={cn("data-[fs-error]:text-destructive", className)} {...$$restProps}>
	<slot {labelAttrs} />
</Label>
