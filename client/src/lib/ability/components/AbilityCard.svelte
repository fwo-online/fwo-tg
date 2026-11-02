<script lang="ts">
  import { type Ability, type AbilityState, BRANCHES, getAbilityBranches } from '@fwo/shared';
  import { learnAbility } from '$lib/ability/utils/learn-ability.svelte';
  import Button from '$lib/components/Button.svelte';
  import RankedValues from '$lib/components/RankedValues.svelte';

  type Props = {
    ability: Ability;
    state: AbilityState;
  };

  const { ability, state }: Props = $props();

  const branches = $derived(getAbilityBranches(ability));
  const isMaxRank = $derived(state.rank >= state.maxRank);
  const actionLabel = $derived(state.rank > 0 ? 'Улучшить' : 'Изучить');

  const getAbilityTypeLabel = (item: Ability) => {
    switch (item.kind) {
      case 'magic':
        return `Магия · ${item.lvl} кр.`;
      case 'skill':
        return 'Умение';
      case 'passive':
        return 'Пассивное';
    }
  };
</script>

<div class="rounded border border-black/25 bg-black/10 p-2 text-xs flex flex-col gap-1.5">
  <div class="flex items-start justify-between gap-2">
    <div class="flex flex-col gap-0.5">
      <div class="flex items-center gap-1.5 flex-wrap">
        <strong class="text-sm">{ability.displayName}</strong>
        <span class="text-[10px] opacity-65">Ур. {state.requiredLevel}</span>
      </div>
      {#if branches.length > 1}
        <div class="flex flex-wrap gap-1">
          {#each branches as branchId (branchId)}
            <span class="text-[10px] px-1 py-0.2 rounded bg-black/20 opacity-75">
              {BRANCHES[branchId].icon} {BRANCHES[branchId].name}
            </span>
          {/each}
        </div>
      {/if}
    </div>

    <span
      class={[
        'shrink-0 font-semibold text-xs',
        isMaxRank ? 'text-green-400' : state.rank > 0 ? 'text-yellow-300' : 'opacity-70',
      ]}
    >
      {getAbilityTypeLabel(ability)} · {state.rank}/{state.maxRank}
    </span>
  </div>

  <p class="opacity-85 leading-snug">{ability.description}</p>

  <div class="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
    {#if 'cost' in ability}
      <span class="opacity-65">
        {ability.costType === 'mp' ? '💧' : '⚡'}{ability.cost} {ability.costType.toUpperCase()}
      </span>
    {/if}
    {#if 'chance' in ability}
      <RankedValues label="Шанс" values={ability.chance} rank={state.rank} unit="%" />
    {/if}
    <RankedValues
      label="Эффект"
      values={ability.effect}
      rank={state.rank}
      unit={ability.kind === 'passive' ? '%' : ''}
    />
  </div>

  <div class="flex items-center justify-between gap-2 pt-1 border-t border-black/15">
    {#if isMaxRank}
      <span class="text-green-400 font-semibold">Изучено полностью</span>
    {:else}
      <span class="shrink-0">
        Цена: <strong class="text-yellow-400">{state.nextCost} 💡</strong>
      </span>

      {#if !state.canLearn}
        <span class="text-red-400 text-right leading-tight">{state.lockReason ?? 'Недоступно'}</span>
      {:else}
        <Button
          {@attach learnAbility.attach(
            {
              confirm: `${actionLabel} «${ability.displayName}» за ${state.nextCost}💡?`,
            },
            ability,
          )}
          class="is-primary text-xs! py-0.5! px-2!"
        >
          {actionLabel} за {state.nextCost}💡
        </Button>
      {/if}
    {/if}
  </div>
</div>
