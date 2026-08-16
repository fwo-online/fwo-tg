<script lang="ts">
  import type { Item, ItemComponent } from "@fwo/shared";
  import {
    componentsImageMap,
    getItemComponents,
  } from "$lib/constants/components";
  import { getCharacterContext } from "$lib/constext/character";

  type Props = {
    item: Item;
  };

  const { item }: Props = $props();
  const character = getCharacterContext();
  const characterComponents = $derived(character().components);

  const hasComponents = (component: ItemComponent) => {
    return (
      (characterComponents[component] ?? 0) >=
      (item.craft?.components[component] ?? 0)
    );
  };

  const components = $derived(getItemComponents(item));
</script>

{#if components.length}
  <div class="flex gap-4 flex-wrap text-sm items-center">
    <span class="opacity-75">Компоненты:</span>
    {#each components as component (component)}
      <div class="flex items-center gap-1">
        <img
          height={18}
          width={18}
          src={componentsImageMap[component]}
          alt={component.toString()}
          class="inline-block"
        />
        <span
          class={{ "text-red-500 font-semibold": !hasComponents(component) }}
        >
          {item.craft?.components[component]}
          /
          {characterComponents[component] ?? 0}
        </span>
      </div>
    {/each}
  </div>
{/if}
