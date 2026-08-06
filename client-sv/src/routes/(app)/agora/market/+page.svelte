<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { makeRequest } from "$lib/utils/make-request.svelte";
  import { client, createRequest } from "$lib/api";
  import { invalidate } from "$app/navigation";
  import { getPopupContext } from "$lib/constext/popup";
  import { itemMarketRequiredLevel, type ItemMarket } from "@fwo/shared";
  import { wearList, wearListTranslations } from "$lib/constants/item";
  import { groupBy } from "es-toolkit";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const character = getCharacterContext();
  const popup = getPopupContext()();

  let isBuying = $state(false);
  let isDeleting = $state(false);

  const buyItem = (itemId: string) => {
    popup.confirm({
      message: 'Вы уверены, что хотите купить этот предмет?',
      onConfirm: async () => {
        isBuying = true;
        await makeRequest(() =>
          createRequest(client.market[':id'].$post)({ param: { id: itemId } }),
        );
        isBuying = false;
        await invalidate('app:character');
      },
    });
  };

  const deleteItem = async (itemId: string) => {
    isDeleting = true;
    await makeRequest(() =>
      createRequest(client.market.$delete)({ json: { marketItemID: itemId } }),
    );
    isDeleting = false;
    await invalidate('app:character');
  };

  const inventoryByWear = $derived(groupBy(data.marketItems, ({ item }) => item.wear));
</script>

<Card header="Барахолка">
  {#if data.marketItems.length}
    <div class="flex flex-col gap-2">
      {#each wearList as wear (wear)}
        {#if inventoryByWear[wear]}
          <h5>{wearListTranslations[wear]}</h5>
          {#each inventoryByWear[wear] as marketItem (marketItem.id)}
            <Modal>
              {#snippet trigger()}
                <Button class="flex justify-between">
                  <span>{marketItem.item.info.name}</span>
                  <span>{marketItem.price}💰</span>
                </Button>
              {/snippet}
              <div class="flex flex-col gap-2">
                {#if marketItem.seller.id === character().id}
                  <Button
                    class="flex-1"
                    disabled={isBuying || isDeleting}
                    onclick={() => deleteItem(marketItem.id)}
                  >
                    Снять с продажи
                  </Button>
                {:else}
                  <h5 class="text-sm">Продавец: {marketItem.seller.name}</h5>
                  {#if character().lvl < itemMarketRequiredLevel}
                    <Button disabled>
                      Откроется на {itemMarketRequiredLevel} уровне
                    </Button>
                  {:else}
                    <div class="flex items-center justify-between gap-4">
                      <Button
                        class="flex-1"
                        disabled={isBuying || isDeleting}
                        onclick={() => buyItem(marketItem.id)}
                      >
                        Купить за {marketItem.price}💰
                      </Button>
                      <div>У тебя {character().gold}💰</div>
                    </div>
                  {/if}
                {/if}
              </div>
            </Modal>
          {/each}
        {/if}
      {/each}
    </div>
  {:else}
    <p class="opacity-50">Предметов не найдено</p>
  {/if}

  {#if character().lvl >= itemMarketRequiredLevel}
    <div class="flex flex-col mt-8">
      <Button href="/agora/market/create">Продать предмет</Button>
    </div>
  {/if}
</Card>
