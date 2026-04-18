<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    renderable,
    type Renderable,
  } from "$lib/components/Renderable.svelte";

  interface Props {
    header?: Renderable;
    children: Snippet;
  }

  let { header, children }: Props = $props();
</script>

<div>
  <div class="font-semibold">
    {#if header}
      {@render renderable(header)}
    {/if}
  </div>

  {@render children()}
</div>
