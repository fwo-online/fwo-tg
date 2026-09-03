<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import PassiveSkillDescription from "$lib/passive-skill/components/PassiveSkillDescription.svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const character = getCharacterContext();
  const passiveSkills = $derived(character().passiveSkills);

  const visibleSkills = $derived(
    data.passiveSkills.filter(
      (skill) =>
        (passiveSkills[skill.name] || skill.bonusCost.length) &&
        (!skill.classList || character().class in skill.classList),
    ),
  );

  let selectedSkill = $derived(visibleSkills[0]);
</script>

<div class="h-full flex flex-col">
  <Card header="Пассивные умения" class="mb-1">
    <div class="h-[45vh] overflow-y-auto">
      <div class="flex flex-col gap-2">
        {#each visibleSkills as passiveSkill (passiveSkill.name)}
          <Button
            onclick={() => (selectedSkill = passiveSkill)}
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
</div>
