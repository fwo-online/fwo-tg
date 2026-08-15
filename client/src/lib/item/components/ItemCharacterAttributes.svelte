<script lang="ts">
  import type { CharacterAttributes } from "@fwo/shared";

  const attributes: (keyof CharacterAttributes)[] = [
    "str",
    "dex",
    "con",
    "int",
    "wis",
  ];

  type Props = {
    itemAttributes: CharacterAttributes;
    characterAttributes?: CharacterAttributes;
    showPlus?: boolean;
    label?: string;
  };

  const {
    itemAttributes,
    characterAttributes,
    showPlus = !characterAttributes,
    label,
  }: Props = $props();

  const checkRequirement = (attribute: keyof CharacterAttributes) => {
    if (characterAttributes) {
      return characterAttributes[attribute] < (itemAttributes[attribute] ?? 0);
    }
    return false;
  };

  const activeAttributes = $derived(
    attributes.filter((attr) => (itemAttributes[attr] ?? 0) > 0),
  );
</script>

{#if activeAttributes.length}
  <div class="flex flex-col gap-0.5 text-sm">
    {#if label}
      <span class="opacity-75 text-xs">{label}</span>
    {/if}
    <div class="flex items-center gap-3 flex-wrap">
      {#each activeAttributes as attribute (attribute)}
        {@const value = itemAttributes[attribute] ?? 0}
        {@const isRequired = checkRequirement(attribute)}
        <span class={["flex items-center gap-1", { "text-red-500 font-semibold": isRequired }]}>
          <span class="opacity-75">{attribute.toUpperCase()}</span>
          <span>{showPlus && value ? "+" : ""}{value}</span>
        </span>
      {/each}
    </div>
  </div>
{/if}
