<script lang="ts">
  import type { FloatingText } from "$lib/game/utils/animations.svelte";

  let { items = [] }: { items: FloatingText[] } = $props();
</script>

{#each items as item (item.id)}
  <div
    class={[
      "fwo-floating-text select-none",
      {
        "text-red-500 font-extrabold text-xs":
          item.type === "damage" && !item.isCrit,
        "text-amber-300 font-black text-sm drop-shadow-md scale-110":
          item.type === "damage" && item.isCrit,
        "text-emerald-400 font-extrabold text-xs": item.type === "heal",
        "text-purple-300 font-bold text-xs":
          item.type === "dodge" || item.type === "miss",
        "text-sky-300 font-bold text-xs": item.type === "block",
        "text-cyan-300 font-bold text-xs":
          item.type === "buff" || item.type === "debuff",
      },
    ]}
  >
    {item.text}
  </div>
{/each}
