<script module lang="ts">
  import type { Snippet } from "svelte";

  type Renderable = string | Snippet;

  const isSnippet = (snippet: Renderable): snippet is Snippet =>
    typeof snippet === "function";

  export { renderable, type Renderable };
</script>

{#snippet renderable(children: Renderable)}
  {#if isSnippet(children)}
    {@render children()}
  {:else}
    {children}
  {/if}
{/snippet}
