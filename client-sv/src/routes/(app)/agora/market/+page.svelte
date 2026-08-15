<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import ItemInfo from "$lib/item/components/ItemInfo.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { makeRequest } from "$lib/utils/make-request.svelte";
  import { client, createRequest } from "$lib/api";
  import { invalidate } from "$app/navigation";
  import { itemMarketRequiredLevel } from "@fwo/shared";
  import { wearList, wearListTranslations } from "$lib/constants/item";
  import { groupBy } from "es-toolkit";
  import type { PageProps } from "./$types";
  import { popup } from "$lib/components/Popup/popup.svelte";

  let { data }: PageProps = $props();
  const character = getCharacterContext();

  let isBuying = $state(false);
  let isDeleting = $state(false);

  let selectedMarketItemId = $state<string | undefined>(
    data.marketItems[0]?.id,
  );
  const selectedMarketItem = $derived(
    data.marketItems.find((m) => m.id === selectedMarketItemId) ??
      data.marketItems[0],
  );

  const buyItem = (itemId: string) => {
    popup.confirm({
      message: "Вы уверены, что хотите купить этот предмет?",
      onConfirm: async () => {
        isBuying = true;
        try {
          await makeRequest(() =>
            createRequest(client.market[":id"].$post)({
              param: { id: itemId },
            }),
          );
          await invalidate("app:character");
        } finally {
          isBuying = false;
        }
      },
    });
  };

  const deleteItem = async (itemId: string) => {
    isDeleting = true;
    try {
      await makeRequest(() =>
        createRequest(client.market.$delete)({
          json: { marketItemID: itemId },
        }),
      );
      await invalidate("app:character");
    } finally {
      isDeleting = false;
    }
  };

  const inventoryByWear = $derived(
    groupBy(data.marketItems, ({ item }) => item.wear),
  );
</script>

<div class="h-full flex flex-col">
  <Card header="Барахолка" class="mb-1">
    <div class="h-[42vh] overflow-y-auto">
      {#if data.marketItems.length}
        <div class="flex flex-col gap-1.5">
          {#each wearList as wear (wear)}
            {#if inventoryByWear[wear]?.length}
              <span class="text-[11px] font-semibold opacity-75 mt-0.5">
                {wearListTranslations[wear]}
              </span>
              {#each inventoryByWear[wear] as marketItem (marketItem.id)}
                <Button
                  class={[
                    "w-full py-1! px-2!",
                    { "is-primary": selectedMarketItem?.id === marketItem.id },
                  ]}
                  onclick={() => (selectedMarketItemId = marketItem.id)}
                >
                  <div class="flex justify-between items-center text-xs">
                    <span>{marketItem.item.info.name}</span>
                    <span>{marketItem.price}💰</span>
                  </div>
                </Button>
              {/each}
            {/if}
          {/each}
        </div>
      {:else}
        <p class="text-sm opacity-50">Предметов не найдено</p>
      {/if}
    </div>

    {#if character().lvl >= itemMarketRequiredLevel}
      <div class="mt-2">
        <Button class="w-full is-primary py-1!" href="/agora/market/create">
          Продать предмет
        </Button>
      </div>
    {/if}
  </Card>

  <Card
    header={selectedMarketItem?.item.info.name}
    class="flex-1 flex flex-col"
  >
    {#if selectedMarketItem}
      <ItemInfo item={selectedMarketItem.item}>
        {#snippet footer(item)}
          <div class="flex flex-col gap-1.5 mt-1">
            {#if selectedMarketItem.seller.id === character().id}
              <Button
                class="w-full py-1.5!"
                disabled={isBuying || isDeleting}
                onclick={() => deleteItem(selectedMarketItem.id)}
              >
                Снять с продажи
              </Button>
            {:else}
              <span class="text-xs opacity-75">
                Продавец: {selectedMarketItem.seller.name}
              </span>
              {#if character().lvl < itemMarketRequiredLevel}
                <Button disabled class="py-1.5!">
                  Откроется на {itemMarketRequiredLevel} уровне
                </Button>
              {:else}
                <div class="flex items-center justify-between gap-3">
                  <Button
                    class="flex-1 is-primary py-1.5!"
                    disabled={isBuying ||
                      isDeleting ||
                      character().gold < selectedMarketItem.price}
                    onclick={() => buyItem(selectedMarketItem.id)}
                  >
                    Купить за {selectedMarketItem.price}💰
                  </Button>
                  <div class="text-xs whitespace-nowrap">
                    У тебя {character().gold}💰
                  </div>
                </div>
              {/if}
            {/if}
          </div>
        {/snippet}
      </ItemInfo>
    {:else}
      <div class="text-sm opacity-50">Выбери предмет</div>
    {/if}
  </Card>
</div>
