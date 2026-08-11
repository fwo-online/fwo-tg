<script lang="ts">
  import type { Action } from '@fwo/shared';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import GameActionTargetSelect from '$lib/game/components/GameActionTargetSelect.svelte';
  import GameOrders from '$lib/game/components/GameOrders.svelte';
  import { game } from '$lib/game/utils/state.svelte';
  import {
    orderAction,
    removeOrder,
    repeatOrders,
    resetOrders,
  } from '$lib/game/utils/order-actions.svelte';

  let selectedAction = $state<Action | null>(null);

  const actions = $derived(game.actions);
  const magics = $derived(game.magics);
  const skills = $derived(game.skills);
  const power = $derived(game.power);

  function isActionDisabled(action: Action) {
    if (action.power) {
      return action.power > power;
    }
    return false;
  }

  function handleSelect(action: Action) {
    selectedAction = action;
  }

  function handleCancel() {
    selectedAction = null;
  }

  const pending = $derived(
    orderAction.pending ||
      removeOrder.pending ||
      repeatOrders.pending ||
      resetOrders.pending,
  );
</script>

<div class="flex flex-col gap-2">
  <!-- Selected orders -->
  <Card header="Выбранные действия">
    <GameOrders isPending={pending} onRemove={(id: string) => removeOrder.run(id)} />
  </Card>

  {#if selectedAction}
    <!-- Target selection + power slider -->
    <GameActionTargetSelect action={selectedAction} onCancel={handleCancel} />
  {:else}
    <!-- Actions section -->
    <Card header="Действия">
      <div class="flex flex-col gap-1 max-h-[50vh] overflow-auto">
        <!-- Control buttons at the top -->
        <div class="flex gap-1 mb-1">
          {#if power === 100 && game.round > 1}
            <Button
              class="p-0 flex-1 text-xs"
              disabled={pending}
              onclick={() => repeatOrders.run()}
            >
              🔄 Повторить
            </Button>
          {/if}
          {#if power !== 100}
            <Button
              class="p-0 flex-1 text-xs"
              disabled={pending}
              onclick={() => resetOrders.run()}
            >
              🗑 Очистить
            </Button>
          {/if}
        </div>

        <!-- Base actions: 2x2 grid with icons -->
        <div class="grid grid-cols-2 gap-1">
          {#each actions as action (action.name)}
            <Button
              class="p-1 text-xs is-primary"
              disabled={pending}
              onclick={() => handleSelect(action)}
            >
              <div class="flex flex-col items-center gap-0.5">
                <span class="text-lg">{action.displayName}</span>
              </div>
            </Button>
          {/each}
        </div>

        <!-- Magics -->
        {#if magics.length}
          <h6 class="text-xs font-bold mt-1">Магии</h6>
          {#each magics as action (action.name)}
            <Button
              class="p-0 text-xs is-primary"
              disabled={pending}
              onclick={() => handleSelect(action)}
            >
              <div class="flex w-full justify-between">
                <span>{action.displayName}</span>
                <span>{action.cost}💧</span>
              </div>
            </Button>
          {/each}
        {/if}

        <!-- Skills -->
        {#if skills.length}
          <h6 class="text-xs font-bold mt-1">Умения</h6>
          {#each skills as action (action.name)}
            <Button
              class="p-0 text-xs is-primary"
              disabled={isActionDisabled(action) || pending}
              onclick={() => handleSelect(action)}
            >
              <div class="flex w-full justify-between">
                <span>{action.displayName}</span>
                <span>{action.cost}🔋</span>
              </div>
            </Button>
          {/each}
        {/if}
      </div>
    </Card>
  {/if}
</div>
