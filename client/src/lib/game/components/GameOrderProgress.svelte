<script lang="ts">
  import { useInterval } from "runed";
  import { game } from "$lib/game/utils/state.svelte";

  const ordersTime = $derived(game.ordersTime);
  const ordersStartTime = $derived(game.ordersStartTime);
  const threshold = 1000;

  let remainTime = $state(0);

  useInterval(() => 100, {
    callback: () => {
      remainTime = Math.max(
        0,
        ordersStartTime + ordersTime - Date.now() - threshold,
      );
    },
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
