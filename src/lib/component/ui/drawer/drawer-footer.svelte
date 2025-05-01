<script>
    import { cn } from "$lib/util";

    export let el = undefined;
    let className = undefined;
    export { className as class };
</script>

<div bind:this={el} class={cn("mt-auto flex flex-col gap-2 p-4", className)} {...$$restProps}>
    <slot />
</div> 