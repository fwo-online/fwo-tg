<script lang="ts">
  import {
    canLearnMagic,
    getLearnMagicCost,
    SECOND_BRANCH_MIN_CHAR_LVL,
  } from "@fwo/shared";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { learnSpecificMagic } from "$lib/magic/utils/learn-specific-magic.svelte";
  // import { resetMagics } from "$lib/magic/utils/reset-magics.svelte";
  import { selectBranch } from "$lib/magic/utils/select-branch.svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const character = getCharacterContext();

  let mode = $state<"branches" | "learn">("learn");

  // Выбранная ветка для вкладки изучения
  let activeLearnBranch = $state<string>(
    data.branchesInfo.selectedBranches[0] ??
      data.branchesInfo.branches[0]?.id ??
      "",
  );

  $effect(() => {
    if (!activeLearnBranch && data.branchesInfo.selectedBranches[0]) {
      activeLearnBranch = data.branchesInfo.selectedBranches[0];
    }
  });

  const selectedBranchesCount = $derived(
    data.branchesInfo.selectedBranches.length,
  );
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
      <div
        class="flex flex-col flex-1 justify-between pr-1 max-h-full overflow-hidden"
      >
        <div class="flex flex-col gap-2 max-h-full">
          <div class="text-xs opacity-75 leading-tight">
            Выберите до 2 веток специализации. 1-я ветка доступна сразу, 2-я — с
            {SECOND_BRANCH_MIN_CHAR_LVL} уровня. Невыбранная 3-я ветка блокируется.
          </div>

          <div class="flex flex-col gap-2.5 mt-1 overflow-auto">
            {#each data.branchesInfo.branches as branch (branch.id)}
              <div
                class={[
                  "p-2 border-2 border-black/20 rounded flex flex-col gap-1.5",
                  {
                    "bg-blue-900/20 border-blue-500!": branch.isSelected,
                    "opacity-60": !branch.isSelected && !branch.canSelect,
                  },
                ]}
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="font-bold text-sm shrink-0">
                    {branch.icon}
                    {branch.name}
                  </span>
                  {#if branch.isSelected}
                    <span class="text-xs font-semibold text-green-400">
                      ✓ Выбрана
                    </span>
                  {:else if branch.canSelect}
                    <Button
                      {@attach selectBranch.attach(
                        {
                          confirm: `Выбрать ветку «${branch.name}»? Это зафиксирует специализацию!`,
                        },
                        branch.id,
                      )}
                      class="is-primary text-xs! py-0.5! px-2!"
                    >
                      Выбрать
                    </Button>
                  {:else}
                    <span class="text-[10px] text-red-400">
                      {branch.lockReason ?? "Недоступно"}
                    </span>
                  {/if}
                </div>

                <span class="text-xs opacity-80 leading-snug">
                  {branch.description}
                </span>

                <!-- Список заклинаний ветки -->
                {#if data.branchMagics[branch.id]?.length}
                  <div class="flex flex-wrap gap-1 mt-1">
                    {#each data.branchMagics[branch.id] as spell (spell.name)}
                      <span
                        class="text-[10px] bg-black/20 px-1 py-0.5 rounded opacity-75"
                      >
                        {spell.lvl}к: {spell.displayName}
                      </span>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- <div class="mt-4 pt-2 border-t border-black/20 flex flex-col gap-2">
          <Button
            {@attach resetMagics.attach({
              confirm:
                "Сбросить все изученные магии и ветки специализации? Все потраченные бонусы 💡 вернутся на 100%!",
            })}
            class="is-error w-full text-xs! py-1!"
          >
            Сбросить магии и ветки
          </Button>
        </div> -->
      </div>
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
            {#each data.branchesInfo.selectedBranches as branchId (branchId)}
              {@const branchMeta = data.branchesInfo.branches.find(
                (b) => b.id === branchId,
              )}
              <Button
                class={[
                  "flex-1 text-xs! py-1! px-1!",
                  { "is-primary": activeLearnBranch === branchId },
                ]}
                onclick={() => (activeLearnBranch = branchId)}
              >
                {branchMeta?.icon}
                {branchMeta?.name}
              </Button>
            {/each}
          </div>

          <!-- Список заклинаний активной ветки -->
          {@const spells = data.branchMagics[activeLearnBranch] ?? []}
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
