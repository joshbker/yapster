<script>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui"
	import * as AlertDialog from "./index.js"
	import { cn, flyAndScale } from "$lib/util.js"
	export let transition = flyAndScale
	export let transitionConfig = undefined
	let className = undefined
	export { className as class }
</script>

<AlertDialog.Portal>
	<AlertDialog.Overlay />
	<AlertDialogPrimitive.Content
		{transition}
		{transitionConfig}
		class={cn(
			"bg-background fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg sm:rounded-lg md:w-full",
			className
		)}
		{...$$restProps}
	>
		<slot />
	</AlertDialogPrimitive.Content>
</AlertDialog.Portal>
