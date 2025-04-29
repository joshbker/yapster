<script>
    import { Badge, Check } from "lucide-svelte"

    export let size = 6
    let checkSize = size / 2
</script>

<div class="relative">
    <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <Check class="h-{checkSize} w-{checkSize} text-white" strokeWidth={3.5} />
    </div>
    <Badge class="h-{size} w-{size} fill-primary text-primary" />
</div>