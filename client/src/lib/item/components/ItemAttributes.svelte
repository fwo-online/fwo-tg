<script lang="ts">
  import type { Item, MinMax } from "@fwo/shared";
  import { get, isNumber } from "es-toolkit/compat";

  type Props = {
    item: Item;
  };

  const { item }: Props = $props();

  const attributeSections = [
    {
      key: "base",
      attributes: [
        { name: "Урон", key: "hit" },
        { name: "Здоровье", key: "base.hp" },
        { name: "Энергия", key: "base.en" },
        { name: "Мана", key: "base.mp" },
      ],
    },
    {
      key: "phys",
      attributes: [
        { name: "Атака", key: "phys.attack" },
        { name: "Защита", key: "phys.defence" },
      ],
    },
    {
      key: "magic",
      attributes: [
        { name: "Магическая атака", key: "magic.attack" },
        { name: "Магическая защита", key: "magic.defence" },
      ],
    },
    {
      key: "heal",
      attributes: [{ name: "Лечение", key: "heal" }],
    },
  ];

  const isEmpty = (value: number | MinMax | undefined) => {
    if (value === undefined || value === null) return true;
    return isNumber(value) ? !value : !value.min && !value.max;
  };

  const normalizeValue = (value: number | MinMax | undefined) => {
    if (value === undefined || value === null) return "";
    return isNumber(value) ? value : `${value.min} - ${value.max}`;
  };

  const filteredSections = $derived(
    attributeSections
      .map(({ attributes, ...rest }) => ({
        ...rest,
        attributes: attributes.filter(({ key }) => !isEmpty(get(item, key))),
      }))
      .filter(({ attributes }) => Boolean(attributes.length)),
  );
</script>

<div class="flex flex-col gap-1 text-sm">
  {#each filteredSections as section (section.key)}
    {#each section.attributes as { name, key } (key)}
      <div class="flex gap-2 items-baseline">
        <span>{name}</span>
        <span class="flex-1 border-dotted border-b-2 -translate-y-1 opacity-30"></span>
        <span class="font-medium">{normalizeValue(get(item, key))}</span>
      </div>
    {/each}
  {/each}
</div>
