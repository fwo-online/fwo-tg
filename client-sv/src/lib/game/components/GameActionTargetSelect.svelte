<script lang="ts">
  import { type Action, type Player, reservedClanName } from '@fwo/shared';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import { getCharacterContext } from '$lib/constext/character';
  import GamePlayer from '$lib/game/components/GamePlayer.svelte';
  import { orderAction } from '$lib/game/utils/order-actions.svelte';
  import { getAvaiableTargets } from '$lib/game/utils/order-target';
  import { game } from '$lib/game/utils/state.svelte';

  type Props = {
    action: Action;
    onCancel: () => void;
  };

  const { action, onCancel }: Props = $props();

  const character = getCharacterContext()
  const characterID = $derived(character().id);
  const players = $derived(game.players);
  const powerRemain = $derived(game.power);

  const availableTargets: Record<string, Player[]> = $derived.by(() => getAvaiableTargets({
    action,
    players,
    characterID
  }));

  const hasTargets = $derived(
    Object.values(availableTargets).flat().length > 0
  );

  let target = $state<string | null>(null);
  let power = $state(0);

  $effect(() => {
    if (action.power) {
      power = action.power;
    } else {
      power = powerRemain;
    }
  });

  async function handleOrder() {
    if (!target) return;
    await orderAction.run(action.name, target, power);
    onCancel();
  }
</script>

<Card header={action.displayName}>
  {#if hasTargets}
    <div class="text-center text-sm opacity-50 py-2">Нет доступных целей</div>
  {:else}
    {#each Object.entries(availableTargets) as [clan, clanPlayers] (clan)}
      {#if clanPlayers.length}
        <div class="flex flex-col">
          <h6 class="font-semibold text-xs">
            {clan === reservedClanName ? 'Без клана' : clan}
          </h6>
          {#each clanPlayers as player (player.id)}
            <label class="flex items-center gap-2 py-0.5">
              <input
                bind:group={target}
                value={player.id}
                class="nes-radio"
                type="radio"
                name="target-{action.name}"
              />
              <span>
                <GamePlayer
                  characterClass={player.class}
                  name={player.name}
                  isBot={player.isBot}
                />
              </span>
            </label>
          {/each}
        </div>
      {/if}
    {/each}
  {/if}

  <div class="flex flex-col gap-2 mt-2">
    <div class="flex items-center gap-2">
      <span class="text-xs">0</span>
      <input
        class="flex-1"
        type="range"
        min="0"
        max={powerRemain}
        step="1"
        value={power}
        disabled={orderAction.pending}
        oninput={(e) => {
          const val = Number(e.currentTarget.value);
          power = Math.min(powerRemain, val);
        }}
      />
      <span class="text-xs">{powerRemain}</span>
    </div>

    {#if !target}
      <Button disabled class="p-0 text-xs">Выбери цель</Button>
    {:else if !power}
      <Button disabled class="p-0 text-xs">Выбери силу</Button>
    {:else}
      <Button
        class="p-0 text-xs is-primary"
        disabled={orderAction.pending}
        onclick={handleOrder}
      >
        {action.displayName} на {power}%
      </Button>
    {/if}
    <Button class="p-0 text-xs" onclick={onCancel}>Отмена</Button>
  </div>
</Card>
