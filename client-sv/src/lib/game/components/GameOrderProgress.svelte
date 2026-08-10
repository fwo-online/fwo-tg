<script lang="ts">
  import { game } from "$lib/game/utils/state.svelte";

  const ordersTime = $derived(game.ordersTime);
  const ordersStartTime = $derived(game.ordersStartTime);
  const threshold = 1000;

  let remainTime = $derived(ordersTime);

  $effect(() => {
    const interval = setInterval(
      () =>
        (remainTime = ordersStartTime + ordersTime - Date.now() - threshold),
      100,
    );

    return () => clearInterval(interval);
  });
</script>

<progress
  class={[
    "nes-progress h-4",
    {
      "is-success": remainTime >= ordersTime * 0.25,
      "is-warning": remainTime < ordersTime * 0.25,
    },
  ]}
  value={remainTime}
  max={ordersTime}
></progress>
