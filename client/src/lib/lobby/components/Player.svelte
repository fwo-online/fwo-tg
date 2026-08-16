<script lang="ts">
  import type { CharacterClass } from "@fwo/shared";
  import type { Snippet } from "svelte";
  import CharacterImage from "$lib/character/components/CharacterImage.svelte";

  type Props = {
    characterClass: CharacterClass;
    name: string;
    lvl?: number;
    isBot?: boolean;
    append?: Snippet;
  };

  let { characterClass, name, lvl, isBot = false, append }: Props = $props();
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
