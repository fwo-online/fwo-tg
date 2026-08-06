<script lang="ts">
  import type { CharacterPublic } from "@fwo/shared";
  import CharacterImage from "$lib/character/components/CharacterImage.svelte";
  import DescriptionGroup from "$lib/components/Description/description-group.svelte";
  import DescriptionItem from "$lib/components/Description/description-item.svelte";
  import type { Renderable } from "$lib/components/Renderable.svelte";

  const { characters }: { characters: CharacterPublic[] } = $props();
</script>

<DescriptionGroup>
  {#each characters as character (character.id)}
    <DescriptionItem>
      <div class="flex gap-2 items-center">
        <CharacterImage characterClass={character.class} small />
        {character.name} ({character.lvl})
      </div>
    </DescriptionItem>
  {/each}
</DescriptionGroup>
