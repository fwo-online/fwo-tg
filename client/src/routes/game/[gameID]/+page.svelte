<script lang="ts">
  import type { Action } from "@fwo/shared";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import GameOrderActions from "$lib/game/components/GameOrderActions.svelte";
  import GameOrderProgress from "$lib/game/components/GameOrderProgress.svelte";
  import GameOrders from "$lib/game/components/GameOrders.svelte";
  import GameOrderToolbar from "$lib/game/components/GameOrderToolbar.svelte";
  import GameStatus from "$lib/game/components/GameStatus.svelte";
  import RoundBattleLogTicker from "$lib/game/components/RoundBattleLogTicker.svelte";
  import { getAvailableTargets } from "$lib/game/utils/order-target";
  import { game, initGameState } from "$lib/game/utils/state.svelte";

  initGameState();

  let selectedTarget: string | undefined = $state();
  let selectedAction: Action | undefined = $state();
  const character = getCharacterContext();
  const characterID = $derived(character().id);
  const players = $derived(game.players);

  const availableTargets = $derived(
    getAvailableTargets({
      action: selectedAction,
      players,
      characterID,
    }),
  );
</script>

<div class="flex flex-col h-full overflow-hidden">
  {#if game.round}
    <!-- Top: Game info & Timer -->
    <div class="flex flex-col gap-1.5 p-3 pb-0 shrink-0">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-bold text-nowrap">Раунд {game.round}</h3>
        {#if game.canOrder}
          <GameOrderProgress />
        {/if}
      </div>
      <RoundBattleLogTicker />
    </div>

    <!-- Center: Status and Action selection -->
    <div
      class="flex-1 min-h-0 p-3 pt-2 pb-1 flex flex-col gap-2 overflow-hidden"
    >
      <Card class="flex-1 min-h-0 overflow-auto">
        <GameStatus
          bind:selected={selectedTarget}
          {selectedAction}
          selectable={availableTargets}
        />
      </Card>

      {#if game.canOrder}
        <div class="shrink-0">
          <GameOrderActions bind:selectedAction bind:selectedTarget />
        </div>
      {:else}
        <div>Ожидание стадии заказов...</div>
      {/if}
    </div>

    <!-- Bottom: Thumb zone (Orders Chips + Toolbar) -->
    {#if game.canOrder}
      <div
        class="shrink-0 px-3 py-2 border-t border-black/10 dark:border-white/15 flex flex-col gap-1.5 bg-(--tg-theme-secondary-bg-color)"
      >
        <!-- Order Chips -->
        <GameOrders />

        <!-- Toolbar: 🔄 Repeat, 🗑 Reset, ⚡ Power, ✓/⏳ Ready -->
        <GameOrderToolbar />
      </div>
    {/if}
  {:else}
    <div class="flex flex-col gap-2 m-4">
      <h2>Игра начинается...</h2>
    </div>
  {/if}
</div>
