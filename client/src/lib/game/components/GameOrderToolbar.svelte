<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import {
    repeatOrders,
    resetOrders,
  } from "$lib/game/utils/order-actions.svelte";
  import { toggleReady } from "$lib/game/utils/ready.svelte";
  import { game } from "$lib/game/utils/state.svelte";

  const power = $derived(game.power);
  const pending = $derived(
    repeatOrders.pending || resetOrders.pending || toggleReady.pending,
  );

  const canRepeat = $derived(
    power === 100 && game.round > 1 && !game.ready && !pending,
  );
  const canReset = $derived(power !== 100 && !game.ready && !pending);
</script>

<div class="flex items-center justify-between gap-2">
  <div class="flex items-center gap-1.5">
    <!-- Repeat button -->
    <Button
      {@attach repeatOrders.attach({ disabled: () => !canRepeat })}
      class="p-0! h-8! w-8! text-sm flex items-center justify-center after:hidden"
      title="Повторить действия"
    >
      🔄
    </Button>

    <!-- Clear / Reset button -->
    <Button
      {@attach resetOrders.attach({ disabled: () => !canReset })}
      class="p-0! h-8! w-8! text-sm flex items-center justify-center after:hidden"
      title="Очистить действия"
    >
      🗑
    </Button>
  </div>

  <!-- Power indicator badge -->
  <div
    class="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border border-current/20 select-none"
  >
    <span>⚡</span>
    <span class={power === 0 ? "opacity-40" : "text-amber-500 font-bold"}>
      {power}%
    </span>
  </div>

  <!-- Ready toggle button -->
  <Button
    {@attach toggleReady.attach({ disabled: () => !game.canOrder })}
    class={[
      "p-0! h-8! w-8! text-sm flex items-center justify-center after:hidden",
      {
        "is-success": !game.ready,
        "is-error": game.ready,
        invisible: !game.canOrder,
      },
    ]}
    title={game.ready ? "Продолжить ход" : "Завершить ход"}
  >
    {#if game.ready}
      ⏳
    {:else}
      ✓
    {/if}
  </Button>
</div>
