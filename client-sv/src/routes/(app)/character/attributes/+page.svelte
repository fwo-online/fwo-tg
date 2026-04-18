<script lang="ts">
  import { client, createRequest } from "$lib/api";
  import { isArcher, isMage, isPriest, isWarrior } from "$lib/character";
  import Button from "$lib/components/Button.svelte";
  import { mapValues } from "es-toolkit";
  import { Description } from "$lib/components/Description";
  import { getCharacterContext } from "$lib/constext/character";
  import type { CharacterAttributes } from "@fwo/shared";

  const character = getCharacterContext();

  const loadAttributes = async (attributes: CharacterAttributes) => {
    return await createRequest(client.character["dynamic-attributes"].$get)({
      query: mapValues(attributes, (n) => n.toString()),
    });
  };

  const save = async (attributes: CharacterAttributes) => {
    await createRequest(client.character.attributes.$patch)({
      json: attributes,
    });
  };

  let free = $state(character().free);
  let attributes = $state(character().attributes);
  const hasChanges = $derived(free !== character().free);

  const increaseAttribute = (attritubute: keyof CharacterAttributes) => {
    attributes[attritubute]++;
    free--;
  };

  const reset = () => {
    attributes = character().attributes;
    free = character().free;
  };
</script>

<div class="flex flex-col gap-2">
  <Description.Group>
    {@const dynamicAttributes = await loadAttributes(attributes)}

    <Description.Item>
      Урон
      {#snippet after()}
        `${dynamicAttributes.hit.min} - ${dynamicAttributes.hit.max}`,
      {/snippet}
    </Description.Item>
    <Description.Item>
      Атака
      {#snippet after()}
        {dynamicAttributes.phys.attack}
      {/snippet}
    </Description.Item>
    <Description.Item>
      Защита
      {#snippet after()}
        {dynamicAttributes.phys.defence}
      {/snippet}
    </Description.Item>

    <Description.Item>
      Лечение
      {#snippet after()}
        `${dynamicAttributes.heal.min} - ${dynamicAttributes.heal.max}`,
      {/snippet}
    </Description.Item>

    {#if isMage(character()) || isPriest(character())}
      <Description.Item>
        Мана
        {#snippet after()}
          {dynamicAttributes.base.mp}
        {/snippet}
      </Description.Item>

      <Description.Item>
        Восстановление маны
        {#snippet after()}
          {dynamicAttributes.regen.mp}
        {/snippet}
      </Description.Item>
    {/if}
    {#if isArcher(character()) || isWarrior(character())}
      <Description.Item>
        Энергия
        {#snippet after()}
          {dynamicAttributes.base.en}
        {/snippet}
      </Description.Item>
      <Description.Item>
        Восстановление энергии
        {#snippet after()}
          {dynamicAttributes.regen.en}
        {/snippet}
      </Description.Item>
    {/if}
    <Description.Item>
      Магическая атака
      {#snippet after()}
        {dynamicAttributes.magic.attack}
      {/snippet}
    </Description.Item>
    <Description.Item>
      Магическая защита
      {#snippet after()}
        {dynamicAttributes.magic.defence}
      {/snippet}
    </Description.Item>
    {#if isArcher(character())}
      <Description.Item>
        Количество целей для атаки
        {#snippet after()}
          {dynamicAttributes.maxTarget}
        {/snippet}
      </Description.Item>
    {/if}

    {#if isMage(character()) || isPriest(character())}
      <Description.Item>
        Длительность магии
        {#snippet after()}
          {dynamicAttributes.spellLength}
        {/snippet}
      </Description.Item>
    {/if}
  </Description.Group>

  <div class="flex gap-2 font-bold">
    <span>Свободные очки:</span>
    {free}
  </div>

  {#snippet attributeButton(attribute: keyof CharacterAttributes)}
    {@const loading = $effect.pending() > 0}
    <Button
      class="flex flex-col justify-center items-center is-primary text-sm"
      onclick={() => increaseAttribute(attribute)}
      disabled={loading || free <= 0}
    >
      {attribute.toUpperCase()}
      <span class="font-semibold"> {attributes[attribute].toString()}</span>
    </Button>
  {/snippet}

  <div class="flex justify-between gap-2">
    {@render attributeButton("str")}
    {@render attributeButton("dex")}
    {@render attributeButton("con")}
    {@render attributeButton("int")}
    {@render attributeButton("wis")}
  </div>

  <div class="flex gap-2 mt-4">
    <Button class="flex-1" onclick={reset} disabled={!hasChanges}>
      Сбросить
    </Button>
    <Button
      class="flex-1 is-primary"
      onclick={() => save(attributes)}
      disabled={!hasChanges}
    >
      Применить
    </Button>
  </div>
</div>
