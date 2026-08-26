<script lang="ts">
  import { combatAnim } from "$lib/game/utils/animations.svelte";

  const events = $derived(combatAnim.lastEvents);
</script>

{#if events.length > 0}
  <div
    class="flex flex-col gap-1 p-1.5 px-2 bg-black/20 dark:bg-white/5 rounded border border-current/10 text-xs overflow-x-auto"
  >
    <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 opacity-90">
      {#each events as event (event.id)}
        <span class="inline-flex items-center gap-1">
          {#if event.type === "damage"}
            <span class="text-red-400">⚔️</span>
          {:else if event.type === "heal"}
            <span class="text-emerald-400">💚</span>
          {:else if event.type === "dodge"}
            <span class="text-purple-400">💨</span>
          {:else if event.type === "block"}
            <span class="text-sky-400">🛡️</span>
          {:else}
            <span class="text-amber-400">✨</span>
          {/if}
          <span>{event.message || `${event.initiatorName} → ${event.targetName}`}</span>
        </span>
      {/each}
    </div>
  </div>
{/if}
