<script module lang="ts">
  import type { Snippet } from "svelte";

  type Renderable = string | Snippet | undefined;

  const isSnippet = (snippet: Renderable): snippet is Snippet =>
    typeof snippet === "function";

  export { type Renderable, renderable };
</script>

{#snippet renderable(children: Renderable)}
  {#if isSnippet(children)}
    {@render children()}
  {:else}
    {children}
  {/if}
{/snippet}
