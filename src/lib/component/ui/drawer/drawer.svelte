<script>
    import { Drawer as DrawerPrimitive } from "vaul-svelte";
    import { cn } from "$lib/util";
    import { fly } from "svelte/transition";

    let className = undefined;
    export { className as class };
    export let position = "right";
    export let shouldScaleBackground = true;
    export let open = false;
    export let activeSnapPoint = undefined;

    const sides = {
        top: {
            transform: "translateY(-100%)",
            transition: fly,
            transitionParams: { y: "-100%", duration: 300 }
        },
        right: {
            transform: "translateX(100%)",
            transition: fly,
            transitionParams: { x: "100%", duration: 300 }
        },
        bottom: {
            transform: "translateY(100%)",
            transition: fly,
            transitionParams: { y: "100%", duration: 300 }
        },
        left: {
            transform: "translateX(-100%)",
            transition: fly,
            transitionParams: { x: "-100%", duration: 300 }
        }
    };
</script>

<DrawerPrimitive.Root {shouldScaleBackground} bind:open bind:activeSnapPoint {...$$restProps}>
    <slot />
</DrawerPrimitive.Root>

<style>
    :root {
        --drawer-padding: 24px;
    }
</style> 