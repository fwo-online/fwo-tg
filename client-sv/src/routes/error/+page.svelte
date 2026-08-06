<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    error,
    action,
  }: { error?: string | Error; action?: Snippet } = $props();

  const description = $derived(
    error instanceof Error ? error.message : error,
  );
</script>

<div class="flex flex-col justify-between h-screen">
  <div class="flex flex-col items-center justify-center flex-1 gap-2">
    <h2 class="text-lg font-semibold">Ошибка</h2>
    {#if description}
      <p class="text-sm opacity-70">{description}</p>
    {/if}
  </div>
  {#if action}
    <div class="fixed bottom-4 left-2 right-2 flex flex-col">
      {@render action()}
    </div>
  {/if}
</div>
