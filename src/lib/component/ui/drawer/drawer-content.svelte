<script>
    import { Drawer as DrawerPrimitive } from "vaul-svelte";
    import DrawerOverlay from "./drawer-overlay.svelte";
    import { cn } from "$lib/util";

    let className = undefined;
    export { className as class };
</script>

<DrawerPrimitive.Portal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
        class={cn(
            "bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border",
            className
        )}
        {...$$restProps}
    >
        <div class="bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full"></div>
        <slot />
    </DrawerPrimitive.Content>
</DrawerPrimitive.Portal> 