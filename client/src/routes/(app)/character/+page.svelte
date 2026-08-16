<script lang="ts">
  import { isArcher, isWarrior } from "@fwo/shared";
  import characterBackground from "$lib/assets/images/characterBackground.png";
  import CharacterExp from "$lib/character/components/CharacterExp.svelte";
  import CharacterImage from "$lib/character/components/CharacterImage.svelte";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { characterClassNameMap } from "$lib/constants/character";
  import { getCharacterContext } from "$lib/constext/character";

  const character = getCharacterContext();
</script>

<div class="h-full flex flex-col gap-2">
  <Card header={character().name} class="relative bg-transparent!">
    <img
      src={characterBackground}
      class="absolute top-0 left-0 right-0 bottom-0 w-full h-full object-cover object-bottom"
      alt="background"
    />
    <div class="mt-20 mb-2 relative">
      <CharacterImage characterClass={character().class} />
    </div>

    <div class="absolute top-2 right-2 flex flex-col items-end gap-1 text-sm">
      <Card class="py-0 flex justify-center">
        {characterClassNameMap[character().class]}
        {character().lvl}
      </Card>
      <Card class="py-0 px-0 min-w-32">
        <CharacterExp />
      </Card>
    </div>
    <div class="w-full flex items-start justify-between gap-2">
      <Card class="py-0.5 px-2">{character().gold}💰</Card>

      <Card class="py-0.5 px-3">{character().bonus}💡</Card>
    </div>
  </Card>

  <div class="flex gap-2 flex-col">
    <div class="flex gap-2">
      <Button class="flex-1" href="#/character/attributes">
        Характеристики
      </Button>

      {#if isArcher(character()) || isWarrior(character())}
        <Button class="flex-1" href="#/character/skills">Умения</Button>
      {:else}
        <Button class="flex-1" href="#/character/magics">Магии</Button>
      {/if}
    </div>

    <Button href="#/character/passiveSkills">Пассивные навыки</Button>

    <Button href="#/character/inventory">Инвентарь</Button>
    {#if character().clan}
      <Button href="#/character/clan">Клан</Button>
    {:else}
      <Button href="#/character/clan/list">Кланы</Button>
    {/if}
  </div>
</div>
