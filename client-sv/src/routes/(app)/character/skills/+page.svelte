<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import type { PageProps } from "./$types";
  import { learnSkill } from "$lib/skill/utils/learn-skill.svelte";

  const { data }: PageProps = $props();
  const character = getCharacterContext();

  let selectedSkill = $derived(data.skills[0]);
  let isSubmitting = $state(false);

  const currentLevel = $derived(character().skills[selectedSkill.name] ?? 0);
  const requiredLevel = $derived(
    selectedSkill.classList[character().class] ?? 0,
  );
  const nextCost = $derived(selectedSkill.bonusCost[currentLevel]);
  const isMaxLevel = $derived(currentLevel >= selectedSkill.bonusCost.length);
  const isUnlocked = $derived(character().lvl >= requiredLevel);
  const canAfford = $derived(
    nextCost !== undefined && character().bonus >= nextCost,
  );
  const canLearn = $derived(
    !isMaxLevel && isUnlocked && canAfford && !isSubmitting,
  );
</script>

<div class="h-screen flex flex-col">
  <Card header="Умения" class="mb-1">
    <div class="h-[45vh] overflow-y-auto">
      <div class="flex flex-col gap-2">
        {#each data.skills as skill (skill.name)}
          <Button
            onclick={() => (selectedSkill = skill)}
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
      </div>
    </div>
  </Card>

  <Card class="flex-1 flex flex-col">
    <div class="flex flex-col flex-1 justify-between">
      <div class="flex flex-col gap-2 mb-4">
        <span>{selectedSkill.displayName}</span>
        <span class="text-sm">{selectedSkill.description}</span>
      </div>

      <div class="flex items-center gap-4">
        {#if isMaxLevel}
          <Button class="flex-1" disabled>Максимальный уровень</Button>
        {:else if !isUnlocked}
          <Button class="flex-1" disabled>
            Откроется на уровне {requiredLevel}
          </Button>
        {:else}
          <Button
            class="flex-1"
            onclick={() => learnSkill.run(selectedSkill)}
            disabled={!canLearn || learnSkill.pending}
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
</div>
