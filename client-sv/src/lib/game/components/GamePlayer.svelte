<script lang="ts">
  import type { CharacterClass } from "@fwo/shared";
  import type { ClassValue } from "svelte/elements";
  import CharacterImage from "$lib/character/components/CharacterImage.svelte";

  type Props = {
    class?: ClassValue;
    characterClass: CharacterClass;
    name: string;
    lvl?: number;
    isBot?: boolean;
  };

  const {
    class: className,
    characterClass,
    name,
    lvl,
    isBot,
  }: Props = $props();
</script>

<div class={["inline-flex items-center justify-start gap-1.5", className]}>
  {#if lvl}
    <span class="text-xs font-mono opacity-60">[{lvl}]</span>
  {/if}
  {#if !isBot}
    <CharacterImage {characterClass} small />
  {/if}
  <span class="truncate">{name}</span>
</div>
