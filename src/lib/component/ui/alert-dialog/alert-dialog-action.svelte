<script>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui"
	import { buttonVariants } from "$lib/component/ui/button/index.js"
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
</script>

<AlertDialogPrimitive.Action
	class={cn(buttonVariants(), className)}
	{...$$restProps}
	on:click
	on:keydown
	let:builder
>
	<slot {builder} />
</AlertDialogPrimitive.Action>
