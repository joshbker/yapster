<script>
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
</script>

<div
	class={cn("mt-4 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0", className)}
	{...$$restProps}
>
	<slot />
</div>
