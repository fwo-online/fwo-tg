<script lang="ts">
  import { type BranchKey, type BranchMeta, SECOND_BRANCH_MIN_CHAR_LVL } from "@fwo/shared";
  import Button from "$lib/components/Button.svelte";
  import { selectBranch } from "$lib/magic/utils/select-branch.svelte";

  let { branches, actions, confirmSelection = (branch: BranchMeta) => `Выбрать «${branch.name}»?` }: {
    branches: (BranchMeta & { isSelected: boolean; canSelect: boolean; lockReason?: string })[];
    actions: { name: string; displayName: string; branches?: BranchKey[] }[];
    confirmSelection?: (branch: BranchMeta) => string;
  } = $props();
</script>

<div class="flex flex-col flex-1 justify-between pr-1 max-h-full overflow-hidden">
  <div class="flex flex-col gap-2 max-h-full min-h-0">
    <div class="text-xs opacity-75 leading-tight">
      Выберите до 2 веток специализации. 1-я ветка доступна сразу, 2-я — с
      {SECOND_BRANCH_MIN_CHAR_LVL} уровня. Невыбранная 3-я ветка блокируется.
    </div>

    <div class="flex flex-col gap-2.5 mt-1 overflow-auto">
      {#each branches as branch (branch.id)}
        {@const branchActions = actions.filter((action) => action.branches?.includes(branch.id))}
        <div
          class={[
            "p-2 border-2 border-black/20 rounded flex flex-col gap-1.5",
            {
              "bg-blue-900/20 border-blue-500!": branch.isSelected,
              "opacity-60": !branch.isSelected && !branch.canSelect,
            },
          ]}
        >
          <div class="flex items-center justify-between gap-2">
            <span class="font-bold text-sm shrink-0">
              {branch.icon}
              {branch.name}
            </span>
            {#if branch.isSelected}
              <span class="text-xs font-semibold text-green-400">✓ Выбрана</span>
            {:else if branch.canSelect}
              <Button
                class="is-primary text-xs! py-0.5! px-2!"
                {@attach selectBranch.attach({ confirm: confirmSelection(branch) }, branch.id)}
              >
                Выбрать
              </Button>
            {:else}
              <span class="text-[10px] text-red-400">
                {branch.lockReason ?? "Недоступно"}
              </span>
            {/if}
          </div>

          <span class="text-xs opacity-80 leading-snug">{branch.description}</span>

          {#if branchActions.length}
            <div class="flex flex-wrap gap-1 mt-1">
              {#each branchActions as action (action.name)}
                <span class="text-[10px] bg-black/20 px-1 py-0.5 rounded opacity-75">
                  {action.displayName}
                </span>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>