<script>
    import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "$lib/component/ui/dropdown-menu"
    import { Button } from "$lib/component/ui/button"
    import { MoreHorizontal, Flag, Ban, BellOff } from "lucide-svelte"

    export let user;
    export let viewer;


    async function handleReport() {
        alert("Report");
    }

    async function handleBlock() {
        alert("Block");
    }

    async function handleIgnore() {
        alert("Ignore");
    }
</script>

<button on:click|stopPropagation|preventDefault>
    <DropdownMenu>
        <DropdownMenuTrigger>
            <Button variant="outline" class="px-2 h-8">
                <MoreHorizontal class="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem class="gap-2 !text-destructive" on:click={handleReport}>
                <Flag class="h-4 w-4" />
                <p>Report</p>
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2 !text-destructive" on:click={handleBlock}>
                <Ban class="h-4 w-4" />
                <p>Block</p>
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2" on:click={handleIgnore}>
                <BellOff class="h-4 w-4" />
                <p>Ignore</p>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</button>