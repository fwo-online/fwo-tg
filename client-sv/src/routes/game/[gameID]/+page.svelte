<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import GameOrderActions from "$lib/game/components/GameOrderActions.svelte";
  import GameOrderProgress from "$lib/game/components/GameOrderProgress.svelte";
  import GameOrderReady from "$lib/game/components/GameOrderReady.svelte";
  import GameOrders from "$lib/game/components/GameOrders.svelte";
  import GameStatus from "$lib/game/components/GameStatus.svelte";
  import { game, initGameState } from "$lib/game/utils/state.svelte";

  initGameState();
</script>

<div class="flex flex-col h-full">
  {#if game.round}
    <!-- Top: game info -->
    <div class="flex flex-col gap-2 m-4 flex-1 min-h-0 overflow-hidden">
      <div class="flex gap-2">
        <h2 class="text-nowrap">Раунд {game.round}</h2>
        {#if game.canOrder}
          <GameOrderProgress />
        {/if}
      </div>
      <Card class="flex-1 min-h-0 overflow-auto">
        <GameStatus />
      </Card>
    </div>

    <!-- Bottom: orders and actions -->
    <div class="m-4 mt-0 pt-2 border-t-2 border-dashed border-gray-500 flex-1 min-h-0 overflow-auto">
      {#if game.canOrder}
        <div class="flex flex-col gap-2">
          <GameOrderActions />
          <GameOrderReady />
        </div>
      {:else}
        <Card header="Выбранные действия">
          <GameOrders readonly />
        </Card>
      {/if}
    </div>
  {:else}
    <div class="flex flex-col gap-2 m-4">
      <h2>Игра начинается</h2>
    </div>
  {/if}
</div>
