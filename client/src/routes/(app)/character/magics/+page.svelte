<script lang="ts">
  import type { Magic } from "@fwo/shared";
  import { canLearnMagic, getLearnMagicCost } from "@fwo/shared";
  import { times } from "es-toolkit/compat";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { learnMagic } from "$lib/magic/utils/learn-magic.svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const character = getCharacterContext();

  let selectedMagic = $derived<Magic | undefined>(data.magics[0]);

  let mode = $state<"info" | "learn">("info");

  const hasBonus = (lvl: number) => {
    return character().bonus >= getLearnMagicCost(lvl);
  };

  const isDisabled = (lvl: number) =>
    !hasBonus(lvl) ||
    !canLearnMagic(character().lvl, lvl) ||
    !data.availableMagicLevels[lvl] ||
    learnMagic.pending;
</script>

<div class="h-full flex flex-col">
  <Card header="Магии" class="mb-1">
    <div class="h-[45vh] overflow-y-auto">
      <div class="flex flex-col gap-2">
        {#each data.magics as magic (magic.name)}
          <Button
            onclick={() => {
              selectedMagic = magic;
              mode = "info";
            }}
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

  {#if mode === "info"}
    <Card header={selectedMagic?.displayName} class="flex-1 flex flex-col mt-0">
      <div class="flex flex-col flex-1 justify-between">
        {#if selectedMagic}
          {@const currentLevel = character().magics?.[selectedMagic.name] ?? 0}
          <div class="flex flex-col gap-2 mb-4">
            <span class="text-sm">{selectedMagic.description}</span>
            <div class="flex justify-between text-sm opacity-50">
              <span>Уровень</span>
              <span>{selectedMagic.lvl}</span>
            </div>
            <div class="flex justify-between text-sm opacity-50">
              <span>Стоимость</span>
              <span>💧{selectedMagic.cost}</span>
            </div>
            {#if currentLevel > 0}
              <div class="flex justify-between text-sm opacity-50">
                <span>Текущий уровень</span>
                <span>{currentLevel}</span>
              </div>
            {/if}
          </div>
        {:else}
          <div class="text-sm opacity-50">Магия не выбрана</div>
        {/if}

        <Button
          class="is-primary w-full"
          onclick={() => {
            mode = "learn";
            selectedMagic = undefined;
          }}
        >
          Изучение магий
        </Button>
      </div>
    </Card>
  {:else}
    <Card header="Изучение магии" class="flex-1 flex flex-col mt-0">
      <div class="flex flex-col flex-1 justify-between">
        <div class="flex flex-col gap-2">
          <div class="flex justify-end items-center">
            <span class="text-sm">У тебя {character().bonus}💡</span>
          </div>
          <span class="text-xs opacity-75">
            Выбери уровень магии, который хочешь изучить. Будет изучена
            случайная магия выбранного уровня
          </span>

          <div class="grid grid-cols-4 gap-2 mt-2">
            {#each times(4, (i) => i + 1) as lvl (lvl)}
              <Button
                {@attach learnMagic.attach(
                  {
                    confirm: `Стоимость изучения ${getLearnMagicCost(lvl)}💡`,
                  },
                  lvl,
                )}
                class={["px-1! py-2!", { "is-primary": !isDisabled(lvl) }]}
                disabled={isDisabled(lvl)}
              >
                <div
                  class="flex flex-col items-center justify-center text-xs whitespace-nowrap leading-tight"
                >
                  <span>{lvl} LVL</span>
                  <span>
                    {data.availableMagicLevels[lvl]
                      ? `${getLearnMagicCost(lvl)}💡`
                      : "✅"}
                  </span>
                </div>
              </Button>
            {/each}
          </div>
        </div>

        <Button
          class="w-full mt-2"
          onclick={() => {
            mode = "info";
            selectedMagic = data.magics[0];
          }}
        >
          Информация
        </Button>
      </div>
    </Card>
  {/if}
</div>
