<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { makeRequest } from "$lib/utils/make-request.svelte";
  import { client, createRequest } from "$lib/api";
  import { getItemPrice, type Item } from "@fwo/shared";
  import { invalidate } from "$app/navigation";
  import { getPopupContext } from "$lib/constext/popup";

  let {
    items,
    clanForge = false,
  }: { items: Item[]; clanForge?: boolean } = $props();

  const character = getCharacterContext();
  const popup = getPopupContext()();

  const canForge = (item: Item) => {
    const c = character();
    if (c.gold < item.price * 0.2) return false;
    if (!item.craft?.components) return true;
    return Object.entries(item.craft.components).every(
      ([key, value]) => (c.components[key as keyof typeof c.components] ?? 0) >= (value ?? 0),
    );
  };

  const handleForge = async (item: Item) => {
    await makeRequest(async () => {
      if (clanForge) {
        await createRequest(client.clan.forge.item[':code'].$post)({ param: { code: item.code } });
      } else {
        await createRequest(client.inventory[':id'].forge.$post)({ param: { id: item.code } });
      }
      popup.info({ message: `Ты создал ${item.info.name}` });
    });
    await invalidate('app:character');
  };
</script>

{#if items.length}
  <div class="flex flex-col gap-2">
    {#each items as item (item.code)}
      <Modal>
        {#snippet trigger()}
          <Button class="text-start">{item.info.name}</Button>
        {/snippet}
        {#snippet header()}
          {item.info.name}
        {/snippet}
        <div class="flex flex-col gap-2">
          <p>{item.info.description}</p>
          <div class="flex items-center justify-between gap-4">
            <Button
              class="flex-1"
              disabled={!canForge(item)}
              onclick={() => handleForge(item)}
            >
              Создать за {getItemPrice(item.price, item.tier)}💰
            </Button>
            <div>У тебя {character().gold}💰</div>
          </div>
        </div>
      </Modal>
    {/each}
  </div>
{:else}
  <p>Ничего не найдено</p>
{/if}
