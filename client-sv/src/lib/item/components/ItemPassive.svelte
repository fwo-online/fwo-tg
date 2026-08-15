<script lang="ts">
  import { type Item, QuestType } from "@fwo/shared";

  const QUEST_DESCRIPTION: Record<QuestType, string> = {
    [QuestType.Damage]: "Нанести урон",
    [QuestType.Kills]: "Убить противников",
    [QuestType.Heal]: "Восстановить здоровья",
  };

  type Props = {
    passive: NonNullable<Item["passive"]>;
  };

  const { passive }: Props = $props();
</script>

<div class="flex flex-col gap-1 text-sm">
  <div class="flex justify-between items-baseline">
    <span>{passive.name}</span>
    <span class="text-xs opacity-75">{passive.level} lvl</span>
  </div>

  {#if passive.quest}
    <span class="text-xs opacity-75">
      {QUEST_DESCRIPTION[passive.quest.type]}: {passive.quest.progress}/{passive.quest.goal}
    </span>
  {/if}
</div>
