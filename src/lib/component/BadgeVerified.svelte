<script>
    import { Badge, Check } from "lucide-svelte"

    export let size = 6
</script>

<div class="relative">
    <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <Check class="h-{size/2} w-{size/2} text-white" strokeWidth={3.5} />
    </div>
    <Badge class="h-{size} w-{size} fill-primary text-primary" />
</div>