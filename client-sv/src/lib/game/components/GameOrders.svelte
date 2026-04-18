<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import { getGameContext } from "$lib/constext/game";

  type Props = {
    isPending?: boolean;
  } & (
    | { readonly: true; onRemove?: never }
    | { readonly?: never; onRemove: (id: string) => void }
  );

  const props: Props = $props();
  const game = getGameContext();
  const orders = $derived(game.orders);
</script>

{#if orders.length}
  {#each orders as order}
    {@const target = game.players[order.target]}
    <div class="flex justify-between items-center text-sm">
      <span class="mt-2">
        <i>{order.action.displayName}</i> на <b>{target.name}</b>
        ({order.power}%)
      </span>
      {#if !props.readonly}
        <Button
          class="p-0 h-6 w-6 after:hidden"
          disabled={props.isPending}
          onclick={() => props.onRemove(order.id)}
        >
          ✖
        </Button>
      {/if}
    </div>
  {/each}
{:else}
  Выберите действия
{/if}
