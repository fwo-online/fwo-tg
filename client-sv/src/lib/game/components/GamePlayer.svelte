<script lang="ts">
  import { CharacterClass } from "@fwo/shared";
  import CharacterImage from "$lib/character/components/CharacterImage.svelte";

  const props: {
    className?: string;
    characterClass: CharacterClass;
    name: string;
    lvl?: number;
    isBot?: boolean;
  } = $props();
</script>

<div class={["inline-flex justify-start gap-2", props.className]}>
  {#if props.lvl}
    {props.lvl}
  {/if}
  {#if !props.isBot}
    <CharacterImage characterClass={props.characterClass} />
  {/if}
  <div class="flex-1">{props.name}</div>
  <div class="flex-1">{props.name}</div>
</div>
