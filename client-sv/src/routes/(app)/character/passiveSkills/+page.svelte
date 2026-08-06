<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import PassiveSkillModal from "$lib/passive-skill/components/PassiveSkillModal.svelte";
  import type { PassiveSkill } from "@fwo/shared";
  import type { PageProps } from "./$types";
  import { getCharacterContext } from "$lib/constext/character";
  import Button from "$lib/components/Button.svelte";

  const { data }: PageProps = $props();
  let selectedSkill = $state(data.passiveSkills[0]);
  const character = getCharacterContext();
  const visibleSkills = $derived(
    data.passiveSkills.filter(
      (skill) =>
        character().passiveSkills[skill.name] || skill.bonusCost.length,
    ),
  );
</script>

<div class="h-screen flex flex-col">
  <Card header="Пассивные умения" class="mb-1">
    <div class="max-h-[45vh] overflow-y-auto">
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
      <PassiveSkillModal skill={selectedSkill} />
    {/if}
  </Card>
</div>
