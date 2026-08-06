<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import GameOrderProgress from "$lib/game/components/GameOrderProgress.svelte";
  import GameOrderReady from "$lib/game/components/GameOrderReady.svelte";
  import GameOrders from "$lib/game/components/GameOrders.svelte";
  import GameStatus from "$lib/game/components/GameStatus.svelte";
  import { game, initGameState } from "$lib/game/utils/state.svelte";

  initGameState();
</script>

<div class="flex flex-col h-full justify-between">
  {#if game.round}
    <div class="flex flex-col gap-2 m-4 basis-full overflow-hidden">
      <div class="flex gap-2">
        <h2 class="text-nowrap">Раунд {game.round}</h2>
        {#if game.canOrder}
          <GameOrderProgress />
        {/if}
      </div>
      <Card class="basis-full overflow-auto">
        <GameStatus />
      </Card>
    </div>
    <div class="flex flex-col gap-4 m-4">
      <Card header="Выбранные действия">
        <GameOrders readonly />
      </Card>

      <div class="flex flex-col gap-2 mt-auto">
        <!-- <GameOrderModal /> -->

        <GameOrderReady />
      </div>
    </div>
  {:else}
    <div class="flex flex-col gap-2 m-4">
      <h2>Игра начинается</h2>
    </div>
  {/if}
</div>
