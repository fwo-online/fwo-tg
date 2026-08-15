<script lang="ts">
  import type { Action } from "@fwo/shared";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import GameActionTargetSelect from "$lib/game/components/GameActionTargetSelect.svelte";
  import { orderAction } from "$lib/game/utils/order-actions.svelte";
  import { game } from "$lib/game/utils/state.svelte";

  let {
    selectedTarget = $bindable(),
    selectedAction = $bindable(),
  }: {
    selectedTarget: string | undefined;
    selectedAction: Action | undefined;
  } = $props();

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
    selectedTarget = undefined;
  }

  function handleCancel() {
    selectedAction = undefined;
    selectedTarget = undefined;
  }

  const pending = $derived(orderAction.pending);

  const map: Record<string, string> = {
    attack: "ATK",
    protect: "DEF",
    regeneration: "REGEN",
    handsHeal: "HEAL",
  };
</script>

<div class="flex flex-col gap-2">
  {#if selectedAction}
    <Card header={selectedAction.displayName}>
      <!-- Target selection + power slider -->
      <GameActionTargetSelect
        action={selectedAction}
        {selectedTarget}
        onCancel={handleCancel}
      />
    </Card>
  {:else}
    <!-- Actions section -->
    <Card header="Действия">
      <div class="flex flex-col gap-1 max-h-[35vh] overflow-y-auto">
        <!-- Base actions: 4-column grid -->
        <div class="grid grid-cols-4 gap-1">
          {#each actions as action (action.name)}
            <Button
              class="p-1 text-xs is-primary"
              disabled={pending}
              onclick={() => handleSelect(action)}
            >
              <div class="flex flex-col items-center gap-0.5">
                <span class="text-xs font-bold">
                  {map[action.name] ?? action.name}</span
                >
              </div>
            </Button>
          {/each}
        </div>

        <!-- Magics -->
        {#if magics.length}
          <h6 class="text-xs font-bold mt-1.5 opacity-70">Магии</h6>
          <div class="flex flex-col gap-1">
            {#each magics as action (action.name)}
              <Button
                class="p-1 text-xs is-primary"
                disabled={pending}
                onclick={() => handleSelect(action)}
              >
                <div class="flex w-full justify-between items-center">
                  <span>{action.displayName}</span>
                  <span class="font-mono">{action.cost}💧</span>
                </div>
              </Button>
            {/each}
          </div>
        {/if}

        <!-- Skills -->
        {#if skills.length}
          <h6 class="text-xs font-bold mt-1.5 opacity-70">Умения</h6>
          <div class="flex flex-col gap-1">
            {#each skills as action (action.name)}
              <Button
                class="p-1 text-xs is-primary"
                disabled={isActionDisabled(action) || pending}
                onclick={() => handleSelect(action)}
              >
                <div class="flex w-full justify-between items-center">
                  <span>{action.displayName}</span>
                  <span class="font-mono">{action.cost}🔋</span>
                </div>
              </Button>
            {/each}
          </div>
        {/if}
      </div>
    </Card>
  {/if}
</div>
