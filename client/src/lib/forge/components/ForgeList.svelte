<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { makeRequest } from "$lib/utils/make-request.svelte";
  import { client, createRequest } from "$lib/api";
  import { getItemPrice, type Item } from "@fwo/shared";
  import { invalidate } from "$app/navigation";
  import { popup } from "$lib/components/Popup/popup.svelte";
  import ItemInfo from "$lib/item/components/ItemInfo.svelte";

  type Props = {
    items: Item[];
    title?: string;
    clanForge?: boolean;
  };

  let { items, title = "Кузница", clanForge = false }: Props = $props();

  const character = getCharacterContext();

  let selectedItemCode = $state<string | undefined>(items[0]?.code);
  const selectedItem = $derived<Item | undefined>(
    items.find((i) => i.code === selectedItemCode) ?? items[0],
  );

  let isSubmitting = $state(false);

  const canForge = (item: Item) => {
    const c = character();
    if (c.gold < item.price * 0.2) return false;
    if (!item.craft?.components) return true;
    return Object.entries(item.craft.components).every(
      ([key, value]) =>
        (c.components[key as keyof typeof c.components] ?? 0) >= (value ?? 0),
    );
  };

  const handleForge = async (item: Item) => {
    isSubmitting = true;
    try {
      await makeRequest(async () => {
        if (clanForge) {
          await createRequest(client.clan.forge.item[":code"].$post)({
            param: { code: item.code },
          });
        } else {
          await createRequest(client.inventory.forge[":code"].$post)({
            param: { code: item.code },
          });
        }

        popup.info({ message: `Ты создал ${item.info.name}` });
      });
      await invalidate("app:character");
    } finally {
      isSubmitting = false;
    }
  };
</script>

<div class="h-full flex flex-col">
  <Card header={title} class="mb-1">
    <div class="h-[42vh] overflow-y-auto">
      {#if items.length}
        <div class="flex flex-col gap-1.5">
          {#each items as item (item.code)}
            <Button
              class={[
                "flex-1 text-start",
                { "is-primary": selectedItem?.code === item.code },
              ]}
              onclick={() => (selectedItemCode = item.code)}
            >
              <div class="flex justify-between items-center text-sm">
                <span>{item.info.name}</span>
                <span class="opacity-75">
                  {getItemPrice(item.price, item.tier)}💰
                </span>
              </div>
            </Button>
          {/each}
        </div>
      {:else}
        <div class="text-sm opacity-50">Ничего не найдено</div>
      {/if}
    </div>
  </Card>

  <Card header={selectedItem?.info.name} class="flex-1 flex flex-col mt-0">
    {#if selectedItem}
      <ItemInfo item={selectedItem} showComponents={true}>
        {#snippet footer(item)}
          <div class="flex items-center justify-between gap-3 mt-1">
            <Button
              class="flex-1 is-primary py-1.5!"
              disabled={!canForge(item) || isSubmitting}
              onclick={() => handleForge(item)}
            >
              Создать за {getItemPrice(item.price, item.tier)}💰
            </Button>
            <div class="whitespace-nowrap text-xs">
              У тебя {character().gold}💰
            </div>
          </div>
        {/snippet}
      </ItemInfo>
    {:else}
      <div class="text-sm opacity-50">Выбери предмет</div>
    {/if}
  </Card>
</div>
