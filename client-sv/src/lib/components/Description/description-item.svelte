<script lang="ts">
  import {
    renderable,
    type Renderable,
  } from "$lib/components/Renderable.svelte";

  const {
    disabled,
    children,
    after,
  }: { disabled?: boolean; children: Renderable; after?: Renderable } =
    $props();
</script>

<div
  class={[
    "flex items-center justify-between text-sm",
    {
      "opacity-50": disabled,
    },
  ]}
>
  <span>
    {@render renderable(children)}
  </span>
  {#if after}
    <div>
      {@render renderable(after)}
    </div>
  {/if}
</div>
