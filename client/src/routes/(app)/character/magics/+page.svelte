<script lang="ts">
  import {
    type BranchKey,
    canLearnMagic,
    getLearnMagicCost,
  } from "@fwo/shared";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { learnSpecificMagic } from "$lib/magic/utils/learn-specific-magic.svelte";

  import BranchPicker from "$lib/skill/components/BranchPicker.svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const character = getCharacterContext();

  let mode = $state<"branches" | "learn">("learn");

  // Выбранная ветка для вкладки изучения
  let activeLearnBranch = $state<BranchKey | "">("");
  const currentLearnBranch = $derived(
    activeLearnBranch && character().branches.includes(activeLearnBranch)
      ? activeLearnBranch
      : (character().branches[0] ?? ""),
  );

  const selectedBranchesCount = $derived(character().branches.length);
</script>

<div class="h-full flex flex-col gap-1">
  <!-- Навигационные вкладки -->
  <div class="grid grid-cols-2 gap-1">
    <Button
      class={["text-xs! py-1! px-1!", { "is-primary": mode === "learn" }]}
      onclick={() => (mode = "learn")}
    >
      Изучение
    </Button>
    <Button
      class={["text-xs! py-1! px-1!", { "is-primary": mode === "branches" }]}
      onclick={() => (mode = "branches")}
    >
      Ветки ({selectedBranchesCount}/2)
    </Button>
  </div>

  <!-- РЕЖИМ 1: ВЫБОР ВЕТОК СПЕЦИАЛИЗАЦИИ -->
  {#if mode === "branches"}
    <Card
      header="Специализация магии"
      class="flex-1 flex flex-col mt-2 min-h-0"
    >
      <BranchPicker
        branches={data.branchesInfo.branches}
        actions={data.magics.map((spell) => ({
          ...spell,
          displayName: `${spell.lvl}к: ${spell.displayName}`,
        }))}
        confirmSelection={(branch) => `Выбрать ветку «${branch.name}»? Это зафиксирует специализацию!`}
      />
    </Card>

    <!-- РЕЖИМ 2: ИЗУЧЕНИЕ ЗАКЛИНАНИЙ -->
  {:else if mode === "learn"}
    <Card header="Изучение магий" class="flex-1 flex flex-col mt-2 min-h-0">
      <div class="flex flex-col flex-1 max-h-full">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs opacity-75">Доступно:</span>
          <span class="font-bold text-sm text-yellow-400">
            {character().bonus} 💡 бонусов
          </span>
        </div>

        {#if selectedBranchesCount === 0}
          <div
            class="flex flex-col items-center justify-center flex-1 gap-3 py-6 text-center"
          >
            <span class="text-sm opacity-80">
              Сначала выберите специализацию (ветку магии), чтобы изучать
              заклинания!
            </span>
            <Button
              class="is-primary text-xs! py-1! px-4!"
              onclick={() => (mode = "branches")}
            >
              Перейти к веткам
            </Button>
          </div>
        {:else}
          <!-- Вкладки выбранных веток -->
          <div class="flex gap-1 mb-2">
            {#each character().branches as branchId (branchId)}
              {@const branchMeta = data.branchesInfo.branches.find(
                (b) => b.id === branchId,
              )}
              <Button
                class={[
                  "flex-1 text-xs! py-1! px-1!",
                  { "is-primary": currentLearnBranch === branchId },
                ]}
                onclick={() => (activeLearnBranch = branchId)}
              >
                {branchMeta?.icon}
                {branchMeta?.name}
              </Button>
            {/each}
          </div>

          <!-- Список заклинаний активной ветки -->
          {@const spells = data.branchMagics[currentLearnBranch] ?? []}
          <div class="flex flex-col gap-2 overflow-y-auto pr-1">
            {#each spells as spell (spell.name)}
              {@const currentRank = character().magics?.[spell.name] ?? 0}
              {@const isMaxRank = currentRank >= 3}
              {@const cost = getLearnMagicCost(spell.lvl)}
              {@const canLearnCircle = canLearnMagic(
                character().lvl,
                spell.lvl,
              )}
              {@const hasBonus = character().bonus >= cost}
              {@const canLearn = canLearnCircle && hasBonus && !isMaxRank}

              <div
                class="p-2 border border-black/25 rounded flex flex-col gap-1.5 bg-black/10"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <span class="font-bold text-xs">{spell.displayName}</span>
                    <span class="text-[10px] opacity-60 ml-1.5">
                      Круг {spell.lvl}
                    </span>
                  </div>
                  <span
                    class={[
                      "text-xs font-semibold",
                      isMaxRank ? "text-green-400" : "opacity-80",
                    ]}
                  >
                    {currentRank} / 3
                  </span>
                </div>

                <span class="text-[11px] opacity-75 leading-tight">
                  {spell.description}
                  <br />
                  <br />
                  💧{spell.cost}
                </span>

                <div
                  class="flex justify-between items-center mt-1 pt-1 border-t border-black/10"
                >
                  <span class="text-xs">
                    {#if isMaxRank}
                      <span class="text-green-400 font-bold">МАКСИМУМ</span>
                    {:else}
                      Цена: <span class="font-bold text-yellow-400"
                        >{cost} 💡</span
                      >
                    {/if}
                  </span>

                  {#if isMaxRank}
                    <span class="text-[11px] text-green-400"
                      >Изучено полностью</span
                    >
                  {:else if !canLearnCircle}
                    <span class="text-[10px] text-red-400">
                      Нужен {spell.lvl * 2 - 1} ур.
                    </span>
                  {:else if !hasBonus}
                    <span class="text-[10px] text-red-400">
                      Не хватает 💡
                    </span>
                  {:else}
                    <Button
                      {@attach learnSpecificMagic.attach(
                        {
                          confirm: `Выучить «${spell.displayName}» за ${cost}💡? (Шанс: 100%)`,
                        },
                        spell.name,
                      )}
                      class="is-primary text-xs! py-0.5! px-2!"
                    >
                      {currentRank === 0 ? "Изучить" : "Улучшить"}
                    </Button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </Card>
  {/if}
</div>
