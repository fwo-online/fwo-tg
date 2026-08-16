<script lang="ts">
  import {
    type CharacterAttributeKey,
    type CharacterAttributes,
    keys,
  } from "@fwo/shared";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";

  const ATTRIBUTES_KEYS: CharacterAttributeKey[] = [
    "str",
    "dex",
    "con",
    "int",
    "wis",
  ];

  const ATTRIBUTES_MAP: Record<CharacterAttributeKey, { label: string }> = {
    str: {
      label: "STR",
    },
    dex: {
      label: "DEX",
    },
    con: {
      label: "CON",
    },
    int: {
      label: "INT",
    },
    wis: {
      label: "WIS",
    },
  };

  type Props = {
    baseAttributes: CharacterAttributes;
    attributes: CharacterAttributes;
    free: number;
    disabled: boolean;
    save: (attributes: CharacterAttributes) => void;
  };

  let {
    baseAttributes,
    attributes = $bindable(),
    free: initialFree,
    disabled,
    save,
  }: Props = $props();

  const spent = $derived(
    keys(attributes).reduce(
      (acc, key) => acc + (attributes[key] - baseAttributes[key]),
      0,
    ),
  );

  const free = $derived(initialFree - spent);

  function increment(key: CharacterAttributeKey) {
    if (free <= 0) return;

    attributes[key]++;
  }

  function decrement(key: CharacterAttributeKey) {
    if (attributes[key] <= baseAttributes[key]) return;

    attributes[key]--;
  }

  function reset() {
    Object.assign(attributes, baseAttributes);
  }
</script>

<div class="flex gap-2 font-bold">
  <span>Свободные очки:</span>
  {free}
</div>

<div class="flex justify-between gap-2">
  {#each ATTRIBUTES_KEYS as key}
    {@const value = attributes[key]}
    {@const label = ATTRIBUTES_MAP[key].label}
    <Card class="border-2 p-1! flex flex-1 flex-col items-center gap-0">
      <div class="text-center leading-none">
        <div class="font-bold">{label}</div>
      </div>

      <div class="text-2xl font-bold mb-2">{value}</div>

      <div class="grid grid-cols-2 gap-0 w-full">
        <Button
          class="h-8 m-0 p-0"
          disabled={value <= baseAttributes[key] || disabled}
          onclick={() => decrement(key)}
        >
          −
        </Button>

        <Button
          class="h-8 m-0 p-0 is-primary"
          disabled={free <= 0 || disabled}
          onclick={() => increment(key)}
        >
          +
        </Button>
      </div>
    </Card>
  {/each}
</div>

<div class="flex gap-2 mt-4">
  <Button class="flex-1" onclick={reset} disabled={free === initialFree}>
    Сбросить
  </Button>
  <Button
    class="flex-1 is-primary"
    onclick={() => save(attributes)}
    disabled={free === initialFree}
  >
    Применить
  </Button>
</div>
