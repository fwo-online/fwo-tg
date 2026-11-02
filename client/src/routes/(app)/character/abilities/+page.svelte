<script lang="ts">
  import {
    CharacterClass,
    getAbilityState,
    MAX_BRANCHES,
    SECOND_BRANCH_MIN_CHAR_LVL,
    type TreeAbility,
  } from '@fwo/shared';
  import AbilityCard from '$lib/ability/components/AbilityCard.svelte';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import { characterClassNameMap } from '$lib/constants/character';
  import { getCharacterContext } from '$lib/constext/character';
  import { selectBranch } from '$lib/magic/utils/select-branch.svelte';
  import type { PageProps } from './$types';

  const { data }: PageProps = $props();
  const character = getCharacterContext();

  let currentProf = $derived(character().class);

  const currentClassGroup = $derived(data.tree[currentProf]);

  let selectedBranch = $derived(
    currentClassGroup.branches.find((b) => character().branches.includes(b.id)) || currentClassGroup.branches[0]
  );

  const isBranchSelected = $derived(character().branches.includes(selectedBranch.id));
  const branchLockReason = $derived.by(() => {
    if (selectedBranch.class !== character().class) {
      return 'Недоступно для вашего класса';
    }
    if (character().branches.length >= MAX_BRANCHES) {
      return `Достигнут лимит специализаций (${MAX_BRANCHES} ветки)`;
    }
    if (character().branches.length === 1 && character().lvl < SECOND_BRANCH_MIN_CHAR_LVL) {
      return `Откроется на ${SECOND_BRANCH_MIN_CHAR_LVL}-м уровне персонажа`;
    }
  });

  const currentAbilities = $derived<TreeAbility[]>(selectedBranch.abilities);
</script>

<div class="h-full flex flex-col gap-1.5 min-h-0">
  <!-- Табы классов -->
  <div class="grid grid-cols-4 gap-1" role="tablist" aria-label="Классы">
    {#each Object.values(CharacterClass) as characterClass (characterClass)}
      <Button
        class={[
          'text-xs! py-1! px-1! truncate',
          { 'is-primary': currentProf === characterClass },
        ]}
        onclick={() => {
          currentProf = characterClass;
        }}
      >
        {characterClassNameMap[characterClass]}{characterClass !== character().class ? ' 🔒' : ''}
      </Button>
    {/each}
  </div>

  <!-- Табы веток выбранного класса -->
  <div class="grid grid-cols-3 gap-1" role="tablist" aria-label="Ветки специализации">
    {#each currentClassGroup.branches as branch (branch.id)}
      <Button
        class={[
          'text-xs! py-1! px-1! truncate',
          { 'is-primary': selectedBranch.id === branch.id },
        ]}
        onclick={() => (selectedBranch = branch)}
      >
        {branch.icon} {branch.name}{character().branches.includes(branch.id) ? ' ✓' : ''}
      </Button>
    {/each}
  </div>

  <Card
    header={`${selectedBranch.icon} ${selectedBranch.name}`}
    class="flex-1 min-h-0 flex flex-col mt-1"
  >
    <div class="flex flex-col flex-1 min-h-0 gap-2.5">
      <!-- Чистая шапка ветки без рамки карточки, визуально отделённая от списка способностей -->
      <div class="shrink-0 flex flex-col gap-1.5 pb-2.5 border-b-2 border-black/25 text-xs">
        <div class="flex items-center justify-between gap-2">
          <span>
            Бонусы: <strong class="text-yellow-400">{character().bonus} 💡</strong>
          </span>
          <span>
            Ветки: <strong>{character().branches.length}/{MAX_BRANCHES}</strong>
            <span class="opacity-65">(2-я с {SECOND_BRANCH_MIN_CHAR_LVL} ур.)</span>
          </span>
        </div>

        <p class="opacity-75 italic leading-snug">{selectedBranch.description}</p>

        <div class="pt-0.5">
          {#if isBranchSelected}
            <span class="font-semibold text-green-400">✓ Специализация выбрана</span>
          {:else if !branchLockReason}
            <Button
              {@attach selectBranch.attach(
                {
                  confirm: `Выбрать ветку «${selectedBranch.name}»? Это зафиксирует специализацию!`,
                },
                selectedBranch.id,
              )}
              class="is-primary text-xs! py-1! px-3! w-full"
            >
              Выбрать ветку
            </Button>
          {:else}
            <span class="text-red-400 leading-snug">
              🔒 {branchLockReason}
            </span>
          {/if}
        </div>
      </div>

      <!-- Список способностей ветки -->
      <div class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-0.5 pb-1">
        {#each currentAbilities as ability (`${ability.kind}:${ability.name}`)}
          <AbilityCard {ability} state={getAbilityState(character(), ability, currentProf)} />
        {/each}
      </div>
    </div>
  </Card>
</div>
