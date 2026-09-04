<script lang="ts">
  import type { PassiveSkill } from "@fwo/shared";

  import Button from "$lib/components/Button.svelte";
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
  const canLearn = $derived(
    !isMaxLevel && canAfford && !learnPassiveSkill.pending,
  );
</script>

<div class="flex flex-col flex-1 justify-between">
  <div class="flex flex-col gap-2 mb-4">
    <div class="flex gap-2 text-sm opacity-50">
      <span>Шанс (%):</span>
      <span>{skill.chance.join("/")}</span>
    </div>
    <div class="flex gap-2 text-sm opacity-50">
      <span>Эффект (%):</span>
      <span>{skill.effect.join("/")}</span>
    </div>
    <span class="text-sm">{skill.description}</span>
  </div>

  <div class="flex items-center gap-4">
    {#if !skill.bonusCost.length}
      <Button class="flex-1" disabled>Умение нельзя изучить</Button>
    {:else if isMaxLevel}
      <Button class="flex-1" disabled>Максимальный уровень</Button>
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
