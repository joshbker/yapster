<script>
    import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "$lib/component/ui/dropdown-menu"
    import { Button } from "$lib/component/ui/button"
    import { MoreHorizontal, Flag, Ban, BellOff } from "lucide-svelte"

    export let user;
    export let viewer;
</script>

<button on:click|stopPropagation|preventDefault>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="outline" class="px-2 h-8">
                <MoreHorizontal class="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem class="gap-2 !text-destructive" on:click={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert("Report");
            }}>
                <Flag class="h-4 w-4" />
                <p>Report</p>
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2 !text-destructive" on:click={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert("Block");
            }}>
                <Ban class="h-4 w-4" />
                <p>Block</p>
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2" on:click={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert("Ignore");
            }}>
                <BellOff class="h-4 w-4" />
                <p>Ignore</p>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</button>