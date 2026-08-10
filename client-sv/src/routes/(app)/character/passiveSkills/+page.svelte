<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import type { PageProps } from "./$types";
  import { getCharacterContext } from "$lib/constext/character";
  import Button from "$lib/components/Button.svelte";
  import PassiveSkillDescription from "$lib/passive-skill/components/PassiveSkillDescription.svelte";

  const { data }: PageProps = $props();
  let selectedSkill = $derived(data.passiveSkills[0]);
  const character = getCharacterContext();
  const passiveSkills = $derived(character().passiveSkills);

  const visibleSkills = $derived(
    data.passiveSkills.filter(
      (skill) => passiveSkills[skill.name] || skill.bonusCost.length,
    ),
  );
</script>

<div class="h-screen flex flex-col">
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
  <Card class="flex-1 flex flex-col">
    {#if selectedSkill}
      <PassiveSkillDescription skill={selectedSkill} />
    {/if}
  </Card>
</div>
