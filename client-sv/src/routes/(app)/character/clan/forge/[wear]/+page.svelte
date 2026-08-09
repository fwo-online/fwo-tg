<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { entries, getItemPrice, type Item } from "@fwo/shared";
  import type { PageProps } from "./$types";
  import { getCharacterContext } from "$lib/constext/character";
  import { makeRequest } from "$lib/utils/make-request.svelte";
  import { client, createRequest } from "$lib/api";
  import { invalidate } from "$app/navigation";
  import { wearListTranslations } from "$lib/constants/item";
  import { popup } from "$lib/components/Popup/popup.svelte";

  const { data }: PageProps = $props();
  const character = getCharacterContext();

  const canForge = (item: Item) => {
    if (character().gold < item.price * 0.2) {
      return false;
    }

    return entries(item.craft?.components ?? {}).every(
      ([key, value]) => character().components[key] ?? 0 >= (value ?? 0),
    );
  };

  const handleForge = async (item: Item) => {
    await makeRequest(async () => {
      await createRequest(client.clan.forge.item[":code"].$post)({
        param: { code: item.code },
      });
      popup.info({ message: `Ты создал ${item.info.name}` });
    });
    await invalidate("app:character");
  };
</script>

<Card header={wearListTranslations[data.wear]}>
  <div class="flex flex-col gap-2">
    {#each data.items as item (item.code)}
      <Modal>
        {#snippet trigger()}
          <Button class="text-start">{item.info.name}</Button>
        {/snippet}

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
      </Modal>
    {/each}
  </div>
</Card>
