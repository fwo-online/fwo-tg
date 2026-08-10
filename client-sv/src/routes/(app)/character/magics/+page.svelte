<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import MagicModal from "$lib/magic/components/MagicModal.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { canLearnMagic, getLearnMagicCost } from "@fwo/shared";
  import type { Magic } from "@fwo/shared";
  import { times } from "es-toolkit/compat";
  import type { PageProps } from "./$types";
  import { popup } from "$lib/components/Popup/popup.svelte";
  import { learnMagic } from "$lib/magic/utils/learn-magic.svelte";

  const { data }: PageProps = $props();
  const character = getCharacterContext();

  let selectedMagic = $derived<Magic | undefined>(data.magics[0]);

  const hasBonus = (lvl: number) => {
    return character().bonus >= getLearnMagicCost(lvl);
  };

  const isDisabled = (lvl: number) =>
    !hasBonus(lvl) ||
    !canLearnMagic(character().lvl, lvl) ||
    !data.availableMagicLevels[lvl] ||
    learnMagic.pending;

  const handleLearn = async (lvl: number) => {
    popup.confirm({
      message: `Стоимость изучения ${getLearnMagicCost(lvl)}💡`,
      onConfirm: async () => {
        const magic = await learnMagic.run(lvl);
        if (magic) {
          popup.info({
            title: "Успешное изучение",
            message: magic.displayName,
          });
        }
      },
    });
  };
</script>

<div class="h-screen flex flex-col">
  <Card header="Магии" class="mb-1">
    <div class="h-[45vh] overflow-y-auto">
      <div class="flex flex-col gap-2">
        {#each data.magics as magic (magic.name)}
          <Button
            onclick={() => (selectedMagic = magic)}
            class={{ "is-primary": selectedMagic?.name === magic.name }}
          >
            <div class="flex justify-between items-center text-sm">
              {magic.displayName}
              <div class="opacity-50">
                {character().magics?.[magic.name] ?? 0}
              </div>
            </div>
          </Button>
        {/each}
      </div>
    </div>
  </Card>

  <Card class="flex-1 flex flex-col">
    {#if selectedMagic}
      <MagicModal magic={selectedMagic} />
    {/if}
  </Card>

  <div class="flex p-4">
    <Modal header="Изучение магии">
      {#snippet trigger()}
        <Button class="is-primary flex-1">Изучение магий</Button>
      {/snippet}

      <h5 class="text-sm mb-4">
        Выбери уровень магии, который хочешь изучить. Будет изучена случайная
        магия выбранного уровня
      </h5>
      <div class="flex flex-col gap-2">
        <span class="self-end">У тебя {character().bonus}💡</span>
        {#each times(4, (i) => i + 1) as lvl (lvl)}
          <Button
            class={["flex-1", { "is-primary": !isDisabled(lvl) }]}
            disabled={isDisabled(lvl)}
            onclick={() => handleLearn(lvl)}
          >
            <div class="flex justify-between">
              <span>Уровень {lvl}</span>
              {data.availableMagicLevels[lvl]
                ? `${getLearnMagicCost(lvl)}💡`
                : "✅"}
            </div>
          </Button>
        {/each}
      </div>
    </Modal>
  </div>
</div>
