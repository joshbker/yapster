<script>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui"
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
</script>

<AlertDialogPrimitive.Description
	class={cn("text-muted-foreground text-sm", className)}
	{...$$restProps}
>
	<slot />
</AlertDialogPrimitive.Description>
