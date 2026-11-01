<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import PassiveSkillDescription from "$lib/passive-skill/components/PassiveSkillDescription.svelte";
  import BranchPicker from "$lib/skill/components/BranchPicker.svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const character = getCharacterContext();
  const passiveSkills = $derived(character().passiveSkills);
  let mode = $state<"learn" | "branches">("learn");

  const visibleSkills = $derived(
    data.passiveSkills.filter(
      (skill) =>
        (passiveSkills[skill.name] || skill.bonusCost.length) &&
        (!skill.classList || character().class in skill.classList) &&
        ((passiveSkills[skill.name] ?? 0) > 0 ||
          !skill.branches?.length || skill.branches.some((branch) => character().branches.includes(branch))),
    ),
  );

  let selectedName = $state("");
  const selectedSkill = $derived(visibleSkills.find((skill) => skill.name === selectedName) ?? visibleSkills[0]);
</script>

<div class="h-full flex flex-col">
  <div class="grid grid-cols-2 gap-1 mb-1">
    <Button onclick={() => (mode = "learn")} class={{ "is-primary": mode === "learn" }}>Изучение</Button>
    <Button onclick={() => (mode = "branches")} class={{ "is-primary": mode === "branches" }}>Ветки ({data.branchesInfo.selectedBranches.length}/2)</Button>
  </div>
  {#if mode === "branches"}
    <Card header="Ветки пассивных умений" class="overflow-y-auto">
      <BranchPicker branches={data.branchesInfo.branches} selected={data.branchesInfo.selectedBranches} actions={data.passiveSkills} />
    </Card>
  {:else}
  <Card header="Пассивные умения" class="mb-1">
    <div class="h-[45vh] overflow-y-auto">
      <div class="flex flex-col gap-2">
        {#each visibleSkills as passiveSkill (passiveSkill.name)}
          <Button
            onclick={() => (selectedName = passiveSkill.name)}
            class={{ "is-primary": selectedSkill?.name === passiveSkill.name }}
          >
            <div class="flex justify-between items-center text-sm">
              {passiveSkill.displayName}
              <div class="opacity-50">
                {character().passiveSkills[passiveSkill.name]}
              </div>
            </div>
          </Button>
        {/each}
      </div>
    </div>
  </Card>
  <Card header={selectedSkill?.displayName} class="flex-1 flex flex-col mt-0">
    {#if selectedSkill}
      <PassiveSkillDescription skill={selectedSkill} />
    {/if}
  </Card>
  {/if}
</div>
