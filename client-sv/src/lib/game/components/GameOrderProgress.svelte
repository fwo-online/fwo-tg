<script lang="ts">
  import { getGameContext } from "$lib/constext/game";

  const game = getGameContext();
  const ordersTime = $derived(game.ordersTime);
  const ordersStartTime = $derived(game.ordersStartTime);
  const threshold = 1000;
  let remainTime = $state(ordersTime);

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
