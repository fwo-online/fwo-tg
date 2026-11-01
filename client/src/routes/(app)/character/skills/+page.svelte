<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { learnSkill } from "$lib/skill/utils/learn-skill.svelte";
  import BranchPicker from "$lib/skill/components/BranchPicker.svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const character = getCharacterContext();

  let mode = $state<"learn" | "branches">("learn");
  const visibleSkills = $derived(data.skills.filter((skill) =>
    (character().skills[skill.name] ?? 0) > 0 ||
      !skill.branches?.length || skill.branches.some((branch) => character().branches.includes(branch)),
  ));
  let selectedName = $state("");
  const selectedSkill = $derived(visibleSkills.find((skill) => skill.name === selectedName) ?? visibleSkills[0]);

  const currentLevel = $derived(selectedSkill ? character().skills[selectedSkill.name] ?? 0 : 0);
  const requiredLevel = $derived(
    selectedSkill?.classList[character().class] ?? 0,
  );
  const nextCost = $derived(selectedSkill?.bonusCost[currentLevel]);
  const isMaxLevel = $derived(selectedSkill ? currentLevel >= selectedSkill.bonusCost.length : false);
  const isUnlocked = $derived(character().lvl >= requiredLevel);
  const hasBranch = $derived(
    !selectedSkill?.branches?.length ||
      selectedSkill.branches.some((branch) => character().branches.includes(branch)),
  );
  const canAfford = $derived(
    nextCost !== undefined && character().bonus >= nextCost,
  );
  const canLearn = $derived(!isMaxLevel && isUnlocked && hasBranch && canAfford);
</script>

<div class="h-full flex flex-col">
  <div class="grid grid-cols-2 gap-1 mb-1">
    <Button onclick={() => (mode = "learn")} class={{ "is-primary": mode === "learn" }}>Изучение</Button>
    <Button onclick={() => (mode = "branches")} class={{ "is-primary": mode === "branches" }}>Ветки ({data.branchesInfo.selectedBranches.length}/2)</Button>
  </div>
  {#if mode === "branches"}
    <Card header="Ветки умений" class="overflow-y-auto">
      <BranchPicker branches={data.branchesInfo.branches} selected={data.branchesInfo.selectedBranches} actions={data.skills} />
    </Card>
  {:else}
  <Card header="Умения" class="mb-1">
    <div class="h-[45vh] overflow-y-auto">
      <div class="flex flex-col gap-2">
        {#each visibleSkills as skill (skill.name)}
          <Button
            onclick={() => (selectedName = skill.name)}
            class={{ "is-primary": selectedSkill?.name === skill.name }}
          >
            <div class="flex justify-between items-center text-sm">
              {skill.displayName}
              <div class="opacity-50">
                {character().skills[skill.name] ?? 0}
              </div>
            </div>
          </Button>
        {/each}
        {#if !visibleSkills.length}
          <span class="text-sm">Сначала выберите ветку специализации.</span>
        {/if}
      </div>
    </div>
  </Card>

  {#if selectedSkill}
  <Card header={selectedSkill.displayName} class="flex-1 flex flex-col mt-0">
    <div class="flex flex-col flex-1 justify-between">
      <div class="flex flex-col gap-2 mb-4">
        <span class="text-sm">{selectedSkill.description}</span>
      </div>

      <div class="flex items-center gap-4">
        {#if isMaxLevel}
          <Button class="flex-1" disabled>Максимальный уровень</Button>
        {:else if !isUnlocked}
          <Button class="flex-1" disabled>
            Откроется на уровне {requiredLevel}
          </Button>
        {:else if !hasBranch}
          <Button class="flex-1" disabled>Для улучшения выберите ветку умения</Button>
        {:else}
          <Button
            {@attach learnSkill.attach(
              { disabled: () => !canLearn },
              selectedSkill,
            )}
            class="flex-1"
          >
            {#if learnSkill.pending}
              Изучение...
            {:else}
              Изучить за {nextCost}💡
            {/if}
          </Button>
          <div>У тебя {character().bonus}💡</div>
        {/if}
      </div>
    </div>
  </Card>
  {/if}
  {/if}
</div>
