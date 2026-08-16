<script lang="ts">
  import type { CharacterPublic } from "@fwo/shared";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import LadderListItem from "./LadderListItem.svelte";

  type Props = { ladderList: CharacterPublic[] };

  let { ladderList }: Props = $props();

  const character = getCharacterContext();
  const characterPosition = $derived(
    ladderList.findIndex(({ id }) => character().id === id),
  );
</script>

<Card class="mb-4 mt-4 bg-(--tg-theme-bg-color)!">
  <LadderListItem character={character()} position={characterPosition + 1} />
</Card>
<div class="flex flex-col gap-4 p-4">
  {#each ladderList as char, index (char.id)}
    <LadderListItem
      extraClass="pt-4 border-t-gray-500 border-t-2"
      character={char}
      position={index + 1}
    />
  {/each}
</div>
