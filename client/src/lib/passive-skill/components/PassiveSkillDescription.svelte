<script lang="ts">
  import type { PassiveSkill } from "@fwo/shared";

  import Button from "$lib/components/Button.svelte";
  import RankedValues from "$lib/components/RankedValues.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { learnPassiveSkill } from "$lib/passive-skill/utils/learn-passive-skill.svelte";

  type Props = {
    skill: PassiveSkill;
  };

  const { skill }: Props = $props();

  const character = getCharacterContext();

  const currentLevel = $derived(character().passiveSkills[skill.name] ?? 0);
  const nextCost = $derived(skill.bonusCost[currentLevel]);

  const isMaxLevel = $derived(currentLevel >= skill.bonusCost.length);
  const canAfford = $derived(
    nextCost !== undefined && character().bonus >= nextCost,
  );
  const requiredLevel = $derived(skill.classList?.[character().class] ?? 0);
  const isUnlocked = $derived(character().lvl >= requiredLevel);
  const hasBranch = $derived(
    !skill.branches?.length || skill.branches.some((branch) => character().branches.includes(branch)),
  );
  const canLearn = $derived(
    !isMaxLevel && isUnlocked && hasBranch && canAfford && !learnPassiveSkill.pending,
  );
</script>

<div class="flex flex-col flex-1 justify-between">
  <div class="flex flex-col gap-2 mb-4">
    <div class="flex flex-col gap-1 text-sm">
      <RankedValues label="Шанс" values={skill.chance} rank={currentLevel} unit="%" />
      <RankedValues label="Эффект" values={skill.effect} rank={currentLevel} unit="%" />
    </div>
    <span class="text-sm">{skill.description}</span>
  </div>

  <div class="flex items-center gap-4">
    {#if !skill.bonusCost.length}
      <Button class="flex-1" disabled>Умение нельзя изучить</Button>
    {:else if isMaxLevel}
      <Button class="flex-1" disabled>Максимальный уровень</Button>
    {:else if !isUnlocked}
      <Button class="flex-1" disabled>Откроется на уровне {requiredLevel}</Button>
    {:else if !hasBranch}
      <Button class="flex-1" disabled>Для улучшения выберите ветку умения</Button>
    {:else}
      <Button
        {@attach learnPassiveSkill.attach({ disabled: () => !canLearn }, skill)}
        class="flex-1"
      >
        {#if learnPassiveSkill.pending}
          Изучение...
        {:else}
          Изучить за {nextCost}💡
        {/if}
      </Button>

      <div class="whitespace-nowrap">У тебя {character().bonus}💡</div>
    {/if}
  </div>
</div>
