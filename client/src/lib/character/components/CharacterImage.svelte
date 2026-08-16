<script lang="ts">
  import type { CharacterClass } from "@fwo/shared";
  import { drawCharacterImage } from "$lib/character/utils/draw-character-image";

  type Props = {
    characterClass: CharacterClass;
    small?: boolean;
  };

  const { characterClass, small }: Props = $props();
  let canvas: HTMLCanvasElement;

  const width = $derived(small ? 20 : 100);
  const height = $derived(small ? 20 : 100);

  $effect(() => {
    drawCharacterImage(canvas, characterClass);
  });
</script>

<canvas bind:this={canvas} style="margin: auto" {width} {height}></canvas>
