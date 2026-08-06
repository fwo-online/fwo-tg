<script lang="ts">
  import { type CharacterPublic, reservedClanName } from "@fwo/shared";
  import { groupBy } from "es-toolkit";
  import DescriptionGroup from "$lib/components/Description/description-group.svelte";
  import DescriptionItem from "$lib/components/Description/description-item.svelte";
  import Player from "./Player.svelte";

  let { searchers }: { searchers: CharacterPublic[] } = $props();

  const searchersByClan = $derived(
    groupBy(searchers, ({ clan }) => clan?.name ?? reservedClanName),
  );
</script>

{#if searchers.length}
  {#each Object.entries(searchersByClan) as [clan, clanSearchers] (clan)}
    <DescriptionGroup header={clan === reservedClanName ? "Без клана" : clan}>
      {#each clanSearchers as searcher (searcher.id)}
        <DescriptionItem>
          <Player
            characterClass={searcher.class}
            name={searcher.name}
            lvl={searcher.lvl}
          />
        </DescriptionItem>
      {/each}
    </DescriptionGroup>
  {/each}
{:else}
  <p class="opacity-50">Никого нет</p>
{/if}
