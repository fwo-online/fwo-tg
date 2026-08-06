<script lang="ts">
  import { client, createRequest } from "$lib/api";
  import Button from "$lib/components/Button.svelte";
  import { mapValues } from "es-toolkit";
  import { Description } from "$lib/components/Description";
  import { getCharacterContext } from "$lib/constext/character";
  import {
    type Attributes,
    type CharacterAttributes,
    isArcher,
    isMage,
    isPriest,
    isWarrior,
  } from "@fwo/shared";
  import { formatNumber } from "$lib/utils/format-number";
  import { get } from "es-toolkit/compat";
  import Card from "$lib/components/Card.svelte";

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
  const baseDynamicAttributes = $derived(character().dynamicAttributes);
  const hasChanges = $derived(free !== character().free);

  const increaseAttribute = (attritubute: keyof CharacterAttributes) => {
    attributes[attritubute]++;
    free--;
  };

  const reset = () => {
    attributes = character().attributes;
    free = character().free;
  };

  const dynamicAttributes = $derived(await loadAttributes(attributes));
</script>

{#snippet stat(path: PathsOf)}
  {@const value = get(dynamicAttributes, path)}
  {@const base = get(baseDynamicAttributes, path) ?? 0}
  {@const diff = value - base}

  <span>{formatNumber(value)}</span>

  {#if diff !== 0}
    <span class={diff > 0 ? "text-green-500" : "text-red-500"}>
      ({diff > 0 ? "+" : ""}{formatNumber(diff)})
    </span>
  {/if}
{/snippet}

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

<div class="h-screen flex flex-col">
  <Card header="Характеристики" class="flex-1 mb-1">
    <Description.Group>
      <Description.Item>
        Урон
        {#snippet after()}
          {@render stat("hit.min")} - {@render stat("hit.max")}
        {/snippet}
      </Description.Item>
      <Description.Item>
        Атака
        {#snippet after()}
          {@render stat("phys.attack")}
        {/snippet}
      </Description.Item>
      <Description.Item>
        Защита
        {#snippet after()}
          {@render stat("phys.defence")}
        {/snippet}
      </Description.Item>

      <Description.Item>
        Лечение
        {#snippet after()}
          {@render stat("heal.min")} - {@render stat("heal.max")}
        {/snippet}
      </Description.Item>

      {#if isMage(character()) || isPriest(character())}
        <Description.Item>
          Мана
          {#snippet after()}
            {@render stat("base.mp")}
          {/snippet}
        </Description.Item>

        <Description.Item>
          Восстановление маны
          {#snippet after()}
            {@render stat("regen.mp")}
          {/snippet}
        </Description.Item>
      {/if}
      {#if isArcher(character()) || isWarrior(character())}
        <Description.Item>
          Энергия
          {#snippet after()}
            {@render stat("base.en")}
          {/snippet}
        </Description.Item>
        <Description.Item>
          Восстановление энергии
          {#snippet after()}
            {@render stat("regen.en")}
          {/snippet}
        </Description.Item>
      {/if}
      <Description.Item>
        Магическая атака
        {#snippet after()}
          {@render stat("magic.attack")}
        {/snippet}
      </Description.Item>
      <Description.Item>
        Магическая защита
        {#snippet after()}
          {@render stat("magic.defence")}
        {/snippet}
      </Description.Item>
      {#if isArcher(character())}
        <Description.Item>
          Количество целей для атаки
          {#snippet after()}
            {@render stat("maxTarget")}
          {/snippet}
        </Description.Item>
      {/if}

      {#if isMage(character()) || isPriest(character())}
        <Description.Item>
          Длительность магии
          {#snippet after()}
            {@render stat("spellLength")}
          {/snippet}
        </Description.Item>
      {/if}
    </Description.Group>
  </Card>

  <Card class="flex-0 flex flex-col">
    <div class="flex gap-2 font-bold">
      <span>Свободные очки:</span>
      {free}
    </div>

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
  </Card>
</div>
