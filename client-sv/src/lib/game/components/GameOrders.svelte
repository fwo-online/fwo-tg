<script lang="ts">
  import { removeOrder } from "$lib/game/utils/order-actions.svelte";
  import { game } from "$lib/game/utils/state.svelte";

  type Props = {
    readonly?: boolean;
    isPending?: boolean;
    onRemove?: (id: string) => void;
  };

  const { readonly = false, isPending, onRemove }: Props = $props();

  const orders = $derived(game.orders);
  const pending = $derived(isPending ?? removeOrder.pending);

  function handleRemove(id: string) {
    if (onRemove) {
      onRemove(id);
    } else {
      removeOrder.run(id);
    }
  }
</script>

<div
  class="flex items-center gap-1.5 overflow-x-auto py-1 min-h-8.5 no-scrollbar"
>
  {#if orders.length}
    {#each orders as order (order.id)}
      {@const target = game.players[order.target]}
      <div
        class="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded border border-current/20 bg-black/5 dark:bg-white/10 shrink-0 font-mono select-none"
      >
        <span class="font-bold">{order.action.displayName}</span>
        <span class="opacity-50">→</span>
        <span class="font-semibold">{target?.name ?? "..."}</span>
        <span class="opacity-80">({order.power}%)</span>
        {#if !readonly && !game.ready}
          <button
            type="button"
            class="ml-0.5 text-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer leading-none p-0.5 disabled:opacity-30"
            disabled={pending}
            onclick={() => handleRemove(order.id)}
            title="Удалить приказ"
          >
            ✕
          </button>
        {/if}
      </div>
    {/each}
  {:else}
    <div class="text-xs opacity-50 px-1 italic">Нет выбранных действий</div>
  {/if}
</div>
