<script lang="ts">
  import {
    type Action,
    type GameStatus,
    getClanName,
    type Player,
    reservedClanName,
  } from "@fwo/shared";
  import { mapValues, omit } from "es-toolkit";
  import { Description } from "$lib/components/Description";
  import { getCharacterContext } from "$lib/constext/character";
  import FloatingCombatText from "$lib/game/components/FloatingCombatText.svelte";
  import GameSelectablePlayer from "$lib/game/components/GameSelectablePlayer.svelte";
  import { combatAnim } from "$lib/game/utils/animations.svelte";
  import { game } from "$lib/game/utils/state.svelte";

  let {
    selected = $bindable(),
    selectable = [],
    selectedAction,
  }: {
    selected: string | undefined;
    selectable?: Player[];
    selectedAction: Action | undefined;
  } = $props();

  const character = getCharacterContext();
  const characterID = $derived(character().id);
  const clan = $derived(game.players[characterID]?.clan);

  const alliesStatus = $derived(
    clan
      ? (game.statusByClan[getClanName(clan)] ?? [])
      : (game.statusByClan[reservedClanName]?.filter(
          ({ id }) => characterID === id,
        ) ?? []),
  );

  const enemiesStatus: Record<string, GameStatus[]> = $derived(
    clan
      ? (omit(game.statusByClan, [clan.name]) as Record<string, GameStatus[]>)
      : (mapValues(game.statusByClan, (statuses, clanName) => {
          if (clanName === reservedClanName) {
            return statuses?.filter(({ id }) => id !== characterID) ?? [];
          }
          return statuses ?? [];
        }) as Record<string, GameStatus[]>),
  );

  const enemiesStatusEntries = $derived(Object.entries(enemiesStatus));
  const selectableSet = $derived(new Set(selectable.map(({ id }) => id)));
</script>

{#snippet Status(status: GameStatus, ally: boolean)}
  {@const player = game.players[status.id]}
  {#if player}
    {@const isDead = status.hp !== undefined && status.hp <= 0}
    {@const disabled = !selectableSet.has(player.id) || isDead}
    {@const anim = combatAnim.get(player.id)}
    <div
      class={[
        "relative rounded transition-colors duration-200 px-0.5",
        {
          "fwo-anim-shake": anim.shaking,
          "fwo-anim-hit-flash": anim.flash === "damage",
          "fwo-anim-heal-flash": anim.flash === "heal",
          "fwo-anim-lunge": anim.lunge,
          "fwo-dead-card": isDead,
        },
      ]}
    >
      <FloatingCombatText items={anim.floatingTexts} />
      <Description.Item selectable={!!selectedAction} {disabled}>
        <GameSelectablePlayer
          bind:value={selected}
          id={player.id}
          characterClass={player.class}
          name={player.name}
          isBot={player.isBot}
          {disabled}
        />
        {#snippet after()}
          <div class="flex items-center gap-2 text-xs font-mono">
            {#if isDead}
              <span class="text-red-500 font-bold flex items-center gap-1">
                <span>💀</span>
                <span class="text-[10px] uppercase opacity-75">Повержен</span>
              </span>
            {:else}
              {#if status.hp !== undefined}
                <span class="inline-flex items-center gap-0.5">
                  <span>❤️</span>
                  <span>{status.hp}</span>
                </span>
              {/if}
              {#if ally}
                {#if status.mp !== undefined}<span>💧{status.mp}</span>{/if}
                {#if status.en !== undefined}<span>🔋{status.en}</span>{/if}
              {/if}
            {/if}
          </div>
        {/snippet}
      </Description.Item>
    </div>
  {/if}
{/snippet}

<Description.Group header={clan?.name ?? ""}>
  {#each alliesStatus as status (status.id)}
    {@render Status(status, true)}
  {/each}

  {#each enemiesStatusEntries as [clanName, statuses] (clanName)}
    {#if statuses && statuses.length > 0}
      <Description.Group
        header={clanName === reservedClanName ? "Без клана" : clanName}
      >
        {#each statuses as status (status.id)}
          {@render Status(status, false)}
        {/each}
      </Description.Group>
    {/if}
  {/each}
</Description.Group>
