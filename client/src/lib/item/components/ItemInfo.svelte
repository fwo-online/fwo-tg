<script lang="ts" generics="T extends Item | ItemWithID">
  // biome-ignore lint/correctness/noUnusedImports: generic
  import type { Item, ItemWithID } from "@fwo/shared";
  import { sum } from "es-toolkit";
  import type { Snippet } from "svelte";
  import { characterClassNameMap } from "$lib/constants/character";
  import { getCharacterContext } from "$lib/constext/character";
  import ItemAttributes from "$lib/item/components/ItemAttributes.svelte";
  import ItemCharacterAttributes from "$lib/item/components/ItemCharacterAttributes.svelte";
  import ItemComponents from "$lib/item/components/ItemComponents.svelte";
  import ItemPassive from "$lib/item/components/ItemPassive.svelte";
  import { getItemTypes } from "$lib/item/utils/item-type";

  type Props = {
    item: T;
    showName?: boolean;
    showComponents?: boolean;
    footer?: Snippet<[T]>;
  };

  const {
    item,
    showName = false,
    showComponents = false,
    footer,
  }: Props = $props();
  const character = getCharacterContext();

  const attributes = $derived(character().attributes);
  const showClass = $derived(!item.class.includes(character().class));
  const showCharacterAttributes = $derived(
    sum(Object.values(item.attributes)) > 0,
  );
  const hasRequiredAttributes = $derived(
    sum(Object.values(item.requiredAttributes)) > 0,
  );

  const types = $derived(getItemTypes(item));
</script>

<div class="flex flex-col flex-1 justify-between gap-3">
  <div class="flex flex-col gap-2">
    <div class="flex flex-col gap-0.5">
      {#if showName}
        <div class="flex items-baseline justify-between gap-2">
          <span class="font-bold text-base">{item.info.name}</span>
          <span class="text-xs opacity-75 whitespace-nowrap"
            >{item.tier ?? 0} ур.</span
          >
        </div>
        {#if types.length}
          <span class="text-xs opacity-60">{types.join(" ")}</span>
        {/if}
      {:else}
        <div class="flex items-center justify-between text-xs opacity-75">
          {#if types.length}
            <span>{types.join(" ")}</span>
          {/if}
          <span>{item.tier ?? 0} ур.</span>
        </div>
      {/if}

      {#if showClass}
        <span class="text-xs text-red-500 font-semibold">
          Класс:
          {item.class
            .map((characterClass) => characterClassNameMap[characterClass])
            .join(", ")}
        </span>
      {/if}
    </div>

    {#if item.info.description}
      <p class="text-xs opacity-75">{item.info.description}</p>
    {/if}

    {#if hasRequiredAttributes}
      <ItemCharacterAttributes
        itemAttributes={item.requiredAttributes}
        characterAttributes={attributes}
        label="Требуемые характеристики"
      />
    {/if}

    <ItemAttributes {item} />

    {#if showCharacterAttributes}
      <ItemCharacterAttributes
        itemAttributes={item.attributes}
        label="Характеристики персонажа"
      />
    {/if}

    {#if showComponents && item.craft?.components}
      <ItemComponents {item} />
    {/if}

    {#if item.passive}
      <div class="border-t border-dashed border-white/10 pt-1">
        <div class="flex justify-between items-center mb-0.5 text-xs">
          <span class="font-semibold">Пассивный эффект</span>
          <span class="text-[10px]">
            {item.passive.unlocked ? "🟢 Активен" : "⚪ Неактивен"}
          </span>
        </div>
        <ItemPassive passive={item.passive} />
      </div>
    {/if}
  </div>

  {#if footer}
    <div class="mt-2">
      {@render footer(item)}
    </div>
  {/if}
</div>
