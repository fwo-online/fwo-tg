<script lang="ts">
  import { Description } from "$lib/components/Description";
  import { getCharacterContext } from "$lib/constext/character";
  import GamePlayer from "$lib/game/components/GamePlayer.svelte";
  import { game } from "$lib/game/utils/state.svelte";
  import { reservedClanName, type GameStatus } from "@fwo/shared";
  import { mapValues, omit } from "es-toolkit";

  const character = getCharacterContext();
  const characterID = character().id;
  const clan = $derived(game.players[character().id].clan);

  const alliesStatus = $derived(
    clan
      ? game.statusByClan[clan.name]
      : game.statusByClan[reservedClanName]?.filter(
          ({ id }) => characterID === id,
        ),
  );
  const enemiesStatus: Record<string, GameStatus[]> = $derived(
    clan
      ? omit(game.statusByClan, [clan.name])
      : mapValues(game.statusByClan, (statuses, clan) => {
          if (clan === reservedClanName) {
            return statuses?.filter(({ id }) => id !== characterID);
          }
          return statuses;
        }),
  );

  const enemiesStatusEntries = $derived(Object.entries(enemiesStatus));

  $inspect(enemiesStatusEntries);
</script>

<Description.Group>
  {#snippet header()}
    {clan?.name ?? ""}
  {/snippet}

  {#each alliesStatus as status (status.name)}
    <Description.Item>
      {@const player = game.players[status.id]}
      <GamePlayer
        characterClass={player.class}
        name={player.name}
        isBot={player.isBot}
      />
      {#snippet after()}
        {#if status.hp}❤️{status.hp}{/if}
        {#if status.mp}💧{status.mp}{/if}
        {#if status.en}🔋{status.en}{/if}
      {/snippet}
    </Description.Item>
  {/each}

  {#each enemiesStatusEntries as [clan, statuses] (clan)}
    {#if statuses.length}
      <Description.Group>
        {#snippet header()}
          {clan === reservedClanName ? "Без клана" : clan}
        {/snippet}
        {#each statuses as status (status.name)}
          <Description.Item>
            {@const player = game.players[status.id]}
            <GamePlayer
              characterClass={player.class}
              name={player.name}
              isBot={player.isBot}
            />
            {#snippet after()}
              {#if status.hp}❤️{status.hp}{/if}
            {/snippet}
          </Description.Item>
        {/each}
      </Description.Group>
    {/if}
  {/each}
</Description.Group>
