<script lang="ts">
  import type { CharacterClass } from "@fwo/shared";
  import CharacterImage from "$lib/character/components/CharacterImage.svelte";
  import type { Snippet } from "svelte";

  let {
    characterClass,
    name,
    lvl,
    isBot = false,
    append,
  }: {
    characterClass: CharacterClass;
    name: string;
    lvl?: number;
    isBot?: boolean;
    append?: Snippet;
  } = $props();
</script>

<div class="inline-flex justify-start gap-2">
  {#if lvl}
    {lvl}
  {/if}
  {#if !isBot}
    <CharacterImage {characterClass} small />
  {/if}
  <div class="flex-1">{name}</div>
  {#if append}
    {@render append()}
  {/if}
</div>
