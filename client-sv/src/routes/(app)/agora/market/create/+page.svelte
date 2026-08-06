<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { makeRequest } from "$lib/utils/make-request.svelte";
  import { client, createRequest } from "$lib/api";
  import { invalidate } from "$app/navigation";
  import { wearList, wearListTranslations } from "$lib/constants/item";
  import { groupBy } from "es-toolkit";
  import type { ItemWithID } from "@fwo/shared";

  const character = getCharacterContext();

  const items = $derived(
    character().inventory?.filter((item: ItemWithID) => item.tier > 0) ?? [],
  );
  const equipment = $derived(
    Object.values(character().equipment ?? {})
      .flat()
      .filter(Boolean)
      .map((e: any) => e?.id ?? e),
  );
  const inventoryByWear = $derived(groupBy(items, (item: ItemWithID) => item.wear));

  let isPending = $state(false);
  let prices: Record<string, string> = $state({});

  const handleCreateItem = async (itemId: string) => {
    const price = Number(prices[itemId]);
    if (Number.isNaN(price) || !price) return;
    isPending = true;
    await makeRequest(() =>
      createRequest(client.market.$post)({ json: { itemID: itemId, price } }),
    );
    isPending = false;
    await invalidate('app:character');
  };
</script>

<Card header="Продажа предмета">
  {#if items.length}
    <div class="flex flex-col gap-2">
      {#each wearList as wear (wear)}
        {#if inventoryByWear[wear]}
          <h5>{wearListTranslations[wear]}</h5>
          {#each inventoryByWear[wear] as item (item.id)}
            {@const isEquipped = equipment.includes(item.id)}
            {@const minPrice = Math.ceil(item.price * 0.25)}
            {@const maxPrice = Math.ceil(item.price * 2)}
            {@const price = prices[item.id] ?? ''}
            <Modal>
              {#snippet trigger()}
                <Button disabled={isEquipped}>
                  <div class="flex justify-between">
                    {item.info.name}
                    {#if isEquipped}
                      <div class="opacity-50">Надето</div>
                    {/if}
                  </div>
                </Button>
              {/snippet}
              <div class="flex flex-col gap-2">
                {#if price}
                  <h5>Ты получишь {Math.round(Number(price) * 0.8)}💰</h5>
                {:else}
                  <h5>Ты получишь 80% от указанной цены</h5>
                {/if}
                <input
                  class="nes-input"
                  inputmode="numeric"
                  type="number"
                  min={minPrice}
                  max={maxPrice}
                  placeholder={`Введите цену от ${minPrice} до ${maxPrice}`}
                  value={prices[item.id] ?? ''}
                  oninput={(e) => (prices[item.id] = e.currentTarget.value)}
                />
                <Button
                  disabled={isPending || !price || Number.isNaN(Number(price))}
                  onclick={() => handleCreateItem(item.id)}
                >
                  Выставить на продажу
                </Button>
              </div>
            </Modal>
          {/each}
        {/if}
      {/each}
    </div>
  {:else}
    <p class="opacity-50">Ничего не найдено</p>
  {/if}
</Card>
