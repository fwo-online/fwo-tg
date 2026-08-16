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
  import GameSelectablePlayer from "$lib/game/components/GameSelectablePlayer.svelte";
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
    {@const disabled = !selectableSet.has(player.id)}
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
        <div class="flex items-center gap-2 text-xs">
          {#if status.hp !== undefined}<span>❤️{status.hp}</span>{/if}
          {#if ally}
            {#if status.mp !== undefined}<span>💧{status.mp}</span>{/if}
            {#if status.en !== undefined}<span>🔋{status.en}</span>{/if}
          {/if}
        </div>
      {/snippet}
    </Description.Item>
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
