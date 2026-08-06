<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import { setGameContext } from "$lib/constext/game";
  import GameOrderProgress from "$lib/game/components/GameOrderProgress.svelte";
  import GameOrders from "$lib/game/components/GameOrders.svelte";
  import GameStatus from "$lib/game/components/GameStatus.svelte";
  import { createGameState } from "$lib/game/utils/state";

  const state = $state(createGameState());

  setGameContext(state);
</script>

<div class="flex flex-col h-full justify-between">
  {#if state.round}
    <div class="flex flex-col gap-2 m-4 basis-full overflow-hidden">
      <div class="flex gap-2">
        <h2 class="text-nowrap">Раунд {state.round}</h2>
        {#if state.canOrder}
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

        <!-- <GameOrderReady /> -->
      </div>
    </div>
  {:else}
    <div class="flex flex-col gap-2 m-4">
      <h2>Игра начинается</h2>
    </div>
  {/if}
</div>
