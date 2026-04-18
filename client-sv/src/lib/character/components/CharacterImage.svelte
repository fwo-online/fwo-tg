<script lang="ts">
  import { drawCharacterImage } from "$lib/character/utils/draw-character-image";
  import type { CharacterClass } from "@fwo/shared";

  const {
    characterClass,
    small,
  }: { characterClass: CharacterClass; small?: boolean } = $props();
  let canvas: HTMLCanvasElement;

  const width = $derived(small ? 20 : 100);
  const height = $derived(small ? 20 : 100);

  $effect(() => {
    drawCharacterImage(canvas, characterClass);
  });
</script>

<canvas bind:this={canvas} style="margin: auto" {width} {height}></canvas>
