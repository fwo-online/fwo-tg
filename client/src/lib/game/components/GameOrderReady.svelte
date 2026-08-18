<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import { toggleReady } from "$lib/game/utils/ready.svelte";
  import { game } from "$lib/game/utils/state.svelte";
</script>

<Button
  {@attach toggleReady.attach()}
  class={[
    "mb-2",
    {
      "is-success": !game.ready,
      "is-error": game.ready,
      invisible: !game.canOrder,
    },
  ]}
>
  {#if game.ready}
    Продолжить ход
  {:else}
    Завершить ход
  {/if}
</Button>
