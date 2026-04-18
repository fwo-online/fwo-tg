<script lang="ts">
  import { useEquipItem } from "$lib/character/utils/use-equip-item.svelte";
  import Button from "$lib/components/Button.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { wearList, wearListTranslations } from "$lib/constants/item";
  import { getCharacterContext } from "$lib/constext/character";
  import ItemInfo from "$lib/item/components/ItemInfo.svelte";
  import type { Item } from "@fwo/shared";
  import { groupBy } from "es-toolkit";

  const character = getCharacterContext();
  const equipment = $derived(character().equipment);
  const items = $derived(character().items);
  const itemsByWear = $derived(groupBy(items, ({ wear }) => wear));
  const { equipItem, unEquipItem, isSubmitting } = useEquipItem();

  const isEquipped = (item: Item) => {
    return equipment.some((id) => id === item.id);
  };
</script>

<div class="flex flex-col gap-2">
  {#each wearList as wear (wear)}
    {#if itemsByWear[wear]}
      <h5>{wearListTranslations[wear]}</h5>
    {/if}
    {#each itemsByWear[wear] as item (item.id)}
      {@const equipped = isEquipped(item)}
      <Modal>
        {#snippet trigger()}
          <Button class="w-full flex justify-between">
            {item.info.name}
            {#if equipped}
              <span class="opacity-50">Надето</span>
            {/if}
          </Button>
        {/snippet}

        <ItemInfo {item}>
          {#snippet footer()}
            {#if equipped}
              <Button
                class="w-full"
                disabled={isSubmitting}
                onclick={() => unEquipItem(item)}
              >
                Снять
              </Button>
            {:else}
              <Button
                class="w-full"
                disabled={isSubmitting}
                onclick={() => equipItem(item)}
              >
                Надеть
              </Button>
            {/if}
          {/snippet}
        </ItemInfo>
      </Modal>
    {/each}
  {/each}
</div>
