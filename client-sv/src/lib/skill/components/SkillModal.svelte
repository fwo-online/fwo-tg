<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import type { Skill } from "@fwo/shared";
  import { useLearnSkill } from "$lib/skill/utils/use-learn-skill.svelte";

  type Props = {
    skill: Skill;
  };

  const { skill }: Props = $props();

  const character = getCharacterContext();
  // svelte-ignore state_referenced_locally
  const { isSubmitting, learnSkill } = useLearnSkill(skill);

  const currentLevel = $derived(character().skills[skill.name] ?? 0);
  const requiredLevel = $derived(skill.classList[character().class] ?? 0);
  const nextCost = $derived(skill.bonusCost[currentLevel]);

  const isMaxLevel = $derived(currentLevel >= skill.bonusCost.length);
  const isUnlocked = $derived(character().lvl >= requiredLevel);
  const canAfford = $derived(
    nextCost !== undefined && character().bonus >= nextCost,
  );
  const canLearn = $derived(
    !isMaxLevel && isUnlocked && canAfford && !isSubmitting,
  );
</script>

<Modal>
  {#snippet header()}
    {skill.displayName}
  {/snippet}

  {#snippet trigger()}
    <Button class="w-full">
      <div class="flex justify-between">
        <span>{skill.displayName}</span>
        <span class="opacity-50">{currentLevel}</span>
      </div>
    </Button>
  {/snippet}

  <div class="flex flex-col gap-2 mb-4">
    <span class="text-sm">{skill.description}</span>
  </div>

  <div class="flex items-center gap-4">
    {#if isMaxLevel}
      <Button class="flex-1" disabled>Максимальный уровень</Button>
    {:else if !isUnlocked}
      <Button class="flex-1" disabled>
        Откроется на уровне {requiredLevel}
      </Button>
    {:else}
      <Button class="flex-1" onclick={learnSkill} disabled={!canLearn}>
        {#if isSubmitting}
          Изучение...
        {:else}
          Изучить за {nextCost}💡
        {/if}
      </Button>

      <div>У тебя {character().bonus}💡</div>
    {/if}
  </div>
</Modal>
