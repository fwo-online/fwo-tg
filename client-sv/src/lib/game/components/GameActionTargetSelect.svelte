<script lang="ts">
  import type { Action } from "@fwo/shared";
  import Button from "$lib/components/Button.svelte";
  import Slider from "$lib/components/Slider.svelte";
  import { orderAction } from "$lib/game/utils/order-actions.svelte";
  import { game } from "$lib/game/utils/state.svelte";

  type Props = {
    action: Action;
    selectedTarget: string | undefined;
    onCancel: () => void;
  };

  const { action, selectedTarget, onCancel }: Props = $props();

  const powerRemain = $derived(game.power);
  const targetPlayer = $derived(
    selectedTarget ? game.players[selectedTarget] : undefined,
  );

  let power = $state(0);

  $effect(() => {
    if (action.power) {
      power = action.power;
    } else {
      power = powerRemain;
    }
  });

  async function handleOrder() {
    if (!selectedTarget) return;
    await orderAction.run(action.name, selectedTarget, power);
    onCancel();
  }
</script>

<div class="flex flex-col gap-2 mt-2">
  <div class="flex items-center gap-2">
    <span class="text-xs font-mono">0%</span>
    <Slider
      class="flex-1"
      type="range"
      value={power.toString()}
      min="0"
      max={powerRemain.toString()}
      step="1"
      disabled={orderAction.pending}
      oninput={(e) => {
        const val = Number(e.currentTarget?.value);
        power = Math.min(powerRemain, val);
      }}
    />
    <span class="text-xs font-mono">{powerRemain}%</span>
  </div>

  <div class="flex gap-2">
    {#if !selectedTarget}
      <Button disabled class="flex-1 p-1 text-xs">Выбери цель 👆</Button>
    {:else if !power}
      <Button disabled class="flex-1 p-1 text-xs">Выбери силу</Button>
    {:else}
      <Button
        class="flex-1 p-1 text-xs is-primary"
        disabled={orderAction.pending}
        onclick={handleOrder}
      >
        {action.displayName} → {targetPlayer?.name ?? "..."} ({power}%)
      </Button>
    {/if}
    <Button class="p-1 px-3 text-xs" onclick={onCancel}>✕</Button>
  </div>
</div>
