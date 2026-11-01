<script lang="ts">
  import { SECOND_BRANCH_MIN_CHAR_LVL, type BranchKey, type BranchMeta } from "@fwo/shared";
  import Button from "$lib/components/Button.svelte";
  import { selectBranch } from "$lib/magic/utils/select-branch.svelte";

  let { branches, selected, actions }: {
    branches: (BranchMeta & { isSelected: boolean; canSelect: boolean; lockReason?: string })[];
    selected: string[];
    actions: { displayName: string; branches?: BranchKey[] }[];
  } = $props();
</script>

<div class="flex flex-col gap-2 text-xs">
  <div>Ветки ({selected.length}/2). Вторая открывается с {SECOND_BRANCH_MIN_CHAR_LVL} уровня.</div>
  {#each branches as branch (branch.id)}
    <div class="p-2 border border-black/20 rounded flex flex-col gap-1">
      <div class="flex justify-between items-center gap-2">
        <strong>{branch.icon} {branch.name}</strong>
        {#if branch.isSelected}
          <span>✓ Выбрана</span>
        {:else if branch.canSelect}
          <Button {@attach selectBranch.attach({ confirm: `Выбрать «${branch.name}»?` }, branch.id)}>Выбрать</Button>
        {:else}
          <span>{branch.lockReason}</span>
        {/if}
      </div>
      <span>{branch.description}</span>
      <span class="opacity-70">
        {actions.filter((action) => action.branches?.includes(branch.id)).map((action) => action.displayName).join(" · ")}
      </span>
    </div>
  {/each}
</div>