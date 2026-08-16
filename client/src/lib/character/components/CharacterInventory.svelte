<script lang="ts">
  import CharacterComponents from "$lib/character/components/CharacterComponents.svelte";
  import {
    equipItem,
    unEquipItem,
  } from "$lib/character/utils/use-equip-item.svelte";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { wearList, wearListTranslations } from "$lib/constants/item";
  import { getCharacterContext } from "$lib/constext/character";
  import ItemInfo from "$lib/item/components/ItemInfo.svelte";
  import type { ItemWithID } from "@fwo/shared";
  import { groupBy } from "es-toolkit";

  const character = getCharacterContext();
  const equipment = $derived(character().equipment);
  const items = $derived(character().items);
  const itemsByWear = $derived(groupBy(items, ({ wear }) => wear));

  let selectedItem = $state<ItemWithID | undefined>(character().items[0]);

  const isEquipped = (item: ItemWithID) => {
    return equipment.some((id) => id === item.id);
  };
</script>

<div class="h-full flex flex-col">
  <Card header="Инвентарь" class="mb-1">
    <div class="h-[42vh] overflow-y-auto">
      <div class="flex flex-col gap-2">
        <div>
          <h5>Компоненты</h5>
          <CharacterComponents />
        </div>

        {#if items.length}
          <div class="flex flex-col gap-1.5">
            {#each wearList as wear (wear)}
              {#if itemsByWear[wear]?.length}
                <h5>
                  {wearListTranslations[wear]}
                </h5>
                {#each itemsByWear[wear] as item (item.id)}
                  {@const equipped = isEquipped(item)}
                  <Button
                    class={[
                      "flex-1",
                      { "is-primary": selectedItem?.id === item.id },
                    ]}
                    onclick={() => (selectedItem = item)}
                  >
                    <div class="flex justify-between items-center text-sm">
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
          <div class="text-sm opacity-50">Ничего не найдено</div>
        {/if}
      </div>
    </div>
  </Card>

  <Card header={selectedItem?.info.name} class="flex-1 flex flex-col mt-0">
    {#if selectedItem}
      {@const equipped = isEquipped(selectedItem)}
      <ItemInfo item={selectedItem}>
        {#snippet footer(item)}
          {#if equipped}
            <Button
              {@attach unEquipItem.attach({}, item)}
              class="w-full py-1.5!"
            >
              Снять
            </Button>
          {:else}
            <Button
              {@attach equipItem.attach({}, item)}
              class="w-full is-primary py-1.5!"
            >
              Надеть
            </Button>
          {/if}
        {/snippet}
      </ItemInfo>
    {:else}
      <div class="text-sm opacity-50">Выбери предмет</div>
    {/if}
  </Card>
</div>
