<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import ItemInfo from "$lib/item/components/ItemInfo.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { client, createRequest } from "$lib/api";
  import { invalidate } from "$app/navigation";
  import { wearList, wearListTranslations } from "$lib/constants/item";
  import { groupBy } from "es-toolkit";
  import type { ItemWithID } from "@fwo/shared";
  import { goto } from "$app/navigation";
  import { createRequestRunner } from "$lib/utils/create-request.svelte";

  const character = getCharacterContext();

  const items = $derived(
    character().items?.filter((item: ItemWithID) => item.tier > 0) ?? [],
  );
  const equipment = $derived(character().equipment ?? []);
  const inventoryByWear = $derived(
    groupBy(items, (item: ItemWithID) => item.wear),
  );

  let selectedItem = $derived(items[0]);
  let prices: Record<string, string> = $state({});

  const isEquipped = (item: ItemWithID) => equipment.includes(item.id);

  const createItem = createRequestRunner(
    async (itemId: string, price: number) => {
      await createRequest(client.market.$post)({
        json: { itemID: itemId, price },
      });
      await invalidate("app:character");
      await invalidate("app:market-items");
    },
  );

  const handleCreateItem = async (itemId: string) => {
    const price = Number(prices[itemId]);
    if (Number.isNaN(price) || !price) return;

    await createItem.run(itemId, price);
    goto("/agora/market");
  };
</script>

<div class="h-full flex flex-col">
  <Card header="Продажа предмета" class="mb-1">
    <div class="h-[42vh] overflow-y-auto">
      {#if items.length}
        <div class="flex flex-col gap-1.5">
          {#each wearList as wear (wear)}
            {#if inventoryByWear[wear]?.length}
              <span class="text-[11px] font-semibold opacity-75 mt-0.5">
                {wearListTranslations[wear]}
              </span>
              {#each inventoryByWear[wear] as item (item.id)}
                {@const equipped = isEquipped(item)}
                <Button
                  class={[
                    "w-full py-1! px-2!",
                    { "is-primary": selectedItem?.id === item.id },
                  ]}
                  onclick={() => (selectedItem = item)}
                >
                  <div class="flex justify-between items-center text-xs">
                    <span>{item.info.name}</span>
                    {#if equipped}
                      <span class="opacity-50">Надето</span>
                    {/if}
                  </div>
                </Button>
              {/each}
            {/if}
          {/each}
        </div>
      {:else}
        <p class="text-sm opacity-50">Ничего не найдено</p>
      {/if}
    </div>
  </Card>

  <Card header={selectedItem?.info.name} class="flex-1 flex flex-col">
    {#if selectedItem}
      {@const equipped = isEquipped(selectedItem)}
      {@const minPrice = Math.ceil(selectedItem.price * 0.25)}
      {@const maxPrice = Math.ceil(selectedItem.price * 2)}
      {@const price = prices[selectedItem.id] ?? ""}
      <ItemInfo item={selectedItem}>
        {#snippet footer(item)}
          <div class="flex flex-col gap-1.5 mt-1">
            {#if equipped}
              <Button disabled class="w-full py-1.5!">
                Снимите предмет перед продажей
              </Button>
            {:else}
              {#if price}
                <span class="text-xs">
                  Ты получишь {Math.round(Number(price) * 0.8)}💰
                </span>
              {:else}
                <span class="text-[11px] opacity-75">
                  Ты получишь 80% от указанной цены
                </span>
              {/if}
              <input
                class="nes-input text-xs py-1!"
                inputmode="numeric"
                type="number"
                min={minPrice}
                max={maxPrice}
                placeholder={`Введите цену от ${minPrice} до ${maxPrice}`}
                value={prices[item.id] ?? ""}
                oninput={(e) => (prices[item.id] = e.currentTarget.value)}
              />
              <Button
                class="w-full is-primary py-1.5!"
                disabled={createItem.pending ||
                  !price ||
                  Number.isNaN(Number(price))}
                onclick={() => handleCreateItem(item.id)}
              >
                Выставить на продажу
              </Button>
            {/if}
          </div>
        {/snippet}
      </ItemInfo>
    {:else}
      <div class="text-sm opacity-50">Выбери предмет</div>
    {/if}
  </Card>
</div>
