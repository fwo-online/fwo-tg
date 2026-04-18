<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  // import ItemAttributes from "$lib/item/components/ItemAttributes.svelte";
  // import ItemCharacterAttributes from "$lib/item/components/ItemCharacterAttributes.svelte";
  // import ItemComponents from "$lib/item/components/ItemComponents.svelte";
  // import { characterclassMap } from "$lib/constants/characterClass";
  import type { Item } from "@fwo/shared";
  import { getItemTypes } from "$lib/item/utils/item-type";
  import { sum } from "es-toolkit";
  import {
    renderable,
    type Renderable,
  } from "$lib/components/Renderable.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { characterClassNameMap } from "$lib/constants/character";
  import type { Snippet } from "svelte";

  type Props = {
    item: Item;
    showComponents?: boolean;
    footer: Snippet<[Item]>;
  };

  const { item, showComponents, footer }: Props = $props();
  const character = getCharacterContext();

  const attributes = $derived(character().attributes);
  const showClass = $derived(!item.class.includes(character().class));
  const showCharacterAttributes = $derived(
    sum(Object.values(item.attributes)) > 0,
  );

  const types = getItemTypes(item);
</script>

<div class="flex flex-col gap-2 p-2 pt-0!">
  <div class="flex flex-col">
    {#if types.length}
      <h5 class="text-sm">{types.join(" ")}</h5>
    {/if}

    <h5 class="text-sm">Уровень {item.tier ?? 0}</h5>
    {#if showClass}
      <h5 class="text-sm text-red-500">
        Класс:
        {item.class
          .map((characterClass) => characterClassNameMap[characterClass])
          .join(",")}
      </h5>
    {/if}
  </div>

  {#if item.info.description}
    <h5 class="text-sm">{item.info.description}</h5>
  {/if}

  <div class="text-sm">
    <h5>Требуемые характеристики</h5>
    <!-- <ItemCharacterAttributes
        itemAttributes={item.requiredAttributes}
        characterAttributes={attributes} -->
    />
  </div>
  <div>
    <h5 class="text-sm">Характеристики</h5>
    <!-- <ItemAttributes {item} /> -->
  </div>

  {#if showCharacterAttributes}
    <div>
      <h5 class="text-sm">Характеристики персонажа</h5>
      <!-- <ItemCharacterAttributes itemAttributes={item.attributes} /> -->
    </div>
  {/if}

  {#if showComponents}
    <div>
      <h5 class="text-sm">Требуемые компоненты</h5>
      <!-- <ItemComponents {item} /> -->
    </div>
  {/if}

  <div></div>

  {@render footer(item)}
</div>
