<script lang="ts">
  import { entries, getItemPrice, type Item } from "@fwo/shared";

  import Button from "$lib/components/Button.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { getCharacterContext } from "$lib/constext/character";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const character = getCharacterContext();

  const canForge = (item: Item) => {
    if (character().gold < item.price * 0.2) {
      return false;
    }

    return entries(item.craft?.components ?? {}).every(
      ([key, value]) => (character().components[key] ?? 0) >= (value ?? 0),
    );
  };
</script>

<div class="flex flex-col gap-2">
  {#each data.items as item (item.code)}
    <Modal>
      {#snippet trigger()}
        <Button class="text-start">{item.info.name}</Button>
      {/snippet}

      <div class="flex items-center justify-between gap-4">
        <Button class="flex-1" disabled={!canForge(item)}>
          Создать за {getItemPrice(item.price, item.tier)}💰
        </Button>
        <div>У тебя {character().gold}💰</div>
      </div>
    </Modal>
  {/each}
</div>
