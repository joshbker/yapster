<script>
	import { LinkPreview as HoverCardPrimitive } from "bits-ui";
	import { cn } from "$lib/util.js";
	import { flyAndScale } from "$lib/util.js";

	export let className = undefined;
	export let transition = flyAndScale;
	export let transitionConfig = undefined;
	export let align = "center";
	export let sideOffset = 4;
</script>

<HoverCardPrimitive.Content
	{transition}
	{transitionConfig}
	{align}
	{sideOffset}
	class={cn(
		"bg-popover text-popover-foreground z-50 mt-3 w-64 rounded-md border p-4 shadow-md outline-none",
		className
	)}
	{...$$restProps}
>
	<slot />
</HoverCardPrimitive.Content> 