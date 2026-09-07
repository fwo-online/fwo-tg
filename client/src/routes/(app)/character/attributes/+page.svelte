<script lang="ts">
  import {
    type Attributes,
    type CharacterAttributes,
    isArcher,
    isMage,
    isPriest,
    isWarrior,
  } from "@fwo/shared";
  import { mapValues } from "es-toolkit";
  import { get } from "es-toolkit/compat";
  import { invalidate } from "$app/navigation";
  import { client, createRequest } from "$lib/api";
  import CharacterAttributesEditor from "$lib/character/components/CharacterAttributesEditor.svelte";
  import Card from "$lib/components/Card.svelte";
  import { Description } from "$lib/components/Description";
  import { getCharacterContext } from "$lib/constext/character";
  import { createRequestRunner } from "$lib/utils/create-request.svelte";
  import { formatNumber } from "$lib/utils/format-number";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const character = getCharacterContext();

  let dynamicAttributes = $derived(data.dynamicAttributes);

  const loadAttributes = createRequestRunner(
    async (attributes: CharacterAttributes) => {
      const res = await createRequest(
        client.character["dynamic-attributes"].$get,
      )({
        query: mapValues(attributes, (n) => n.toString()),
      });

      dynamicAttributes = res;
    },
  );

  const save = async (attributes: CharacterAttributes) => {
    await createRequest(client.character.attributes.$patch)({
      json: attributes,
    });
    await invalidate("app:character");
  };

  let free = $derived(character().free);
  let baseAttributes = $derived(character().attributes);
  let attributes = $state({ ...character().attributes });
  const baseDynamicAttributes = $derived(character().dynamicAttributes);

  $effect(() => {
    loadAttributes.run(attributes);
  });
</script>

{#snippet stat(path: PathsOf<Attributes>)}
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

<div class="h-full flex flex-col">
  <Card header="Характеристики" class="flex-1 mb-1">
    <Description.Group>
      <Description.Item>
        Урон
        {#snippet after()}
          {@render stat("hit.physical.min")} - {@render stat("hit.physical.max")}
        {/snippet}
      </Description.Item>

      {#if dynamicAttributes.hit?.fire && (dynamicAttributes.hit.fire.min > 0 || dynamicAttributes.hit.fire.max > 0)}
        <Description.Item>
          🔥 Огонь
          {#snippet after()}
            {@render stat("hit.fire.min")} - {@render stat("hit.fire.max")}
          {/snippet}
        </Description.Item>
      {/if}

      {#if dynamicAttributes.hit?.frost && (dynamicAttributes.hit.frost.min > 0 || dynamicAttributes.hit.frost.max > 0)}
        <Description.Item>
          ❄️ Холод
          {#snippet after()}
            {@render stat("hit.frost.min")} - {@render stat("hit.frost.max")}
          {/snippet}
        </Description.Item>
      {/if}

      {#if dynamicAttributes.hit?.lightning && (dynamicAttributes.hit.lightning.min > 0 || dynamicAttributes.hit.lightning.max > 0)}
        <Description.Item>
          ⚡ Молния
          {#snippet after()}
            {@render stat("hit.lightning.min")} - {@render stat("hit.lightning.max")}
          {/snippet}
        </Description.Item>
      {/if}

      {#if dynamicAttributes.hit?.acid && (dynamicAttributes.hit.acid.min > 0 || dynamicAttributes.hit.acid.max > 0)}
        <Description.Item>
          ☣ Кислота
          {#snippet after()}
            {@render stat("hit.acid.min")} - {@render stat("hit.acid.max")}
          {/snippet}
        </Description.Item>
      {/if}
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

  <Card class="flex-0 flex flex-col mt-0">
    <CharacterAttributesEditor
      bind:attributes
      {baseAttributes}
      {free}
      disabled={loadAttributes.pending}
      {save}
    />
  </Card>
</div>
