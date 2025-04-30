<script>
    import { goto } from "$app/navigation";

    export let user;
</script>

<div class="flex gap-6">
    <button 
        class="text-sm text-muted-foreground hover:underline"
        on:click={(e) => {
            e.preventDefault();
            e.stopPropagation();
            goto(`/@${user.username}/following`);
        }}
    >
        <span class="font-semibold">{user.following?.length ?? 0}</span> {user.following?.length === 1 ? 'following' : 'following'}
    </button>
    <button 
        class="text-sm text-muted-foreground hover:underline"
        on:click={(e) => {
            e.preventDefault();
            e.stopPropagation();
            goto(`/@${user.username}/followers`);
        }}
    >
        <span class="font-semibold">{user.followers?.length ?? 0}</span> {user.followers?.length === 1 ? 'follower' : 'followers'}
    </button>
    <p class="text-sm text-muted-foreground">
        <span class="font-semibold">{user.posts?.length ?? 0}</span> {(user.posts?.length ?? 0) === 1 ? 'post' : 'posts'}
    </p>
</div>