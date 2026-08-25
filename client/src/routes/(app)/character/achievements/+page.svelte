<script lang="ts">
  import type { AchievementCategory, AchievementPublic } from "@fwo/shared";
  import { invalidate } from "$app/navigation";
  import { client, createRequest } from "$lib/api";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { createRequestRunner } from "$lib/utils/create-request.svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const character = getCharacterContext();

  let activeCategory = $state<AchievementCategory | "all">("all");
  let achievementsList = $derived(data.achievements);

  const categories: { key: AchievementCategory | "all"; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "combat", label: "⚔️ Бой" },
    { key: "exploration", label: "🌲 Лес" },
    { key: "tower", label: "🗼 Башня" },
    { key: "craft", label: "🛠️ Кузня" },
    { key: "boss", label: "🐉 Боссы" },
    { key: "mastery", label: "⭐ Ранги" },
  ];

  const filteredAchievements = $derived(
    activeCategory === "all"
      ? achievementsList
      : achievementsList.filter((a) => a.category === activeCategory)
  );

  const completedCount = $derived(
    achievementsList.filter((a) => a.completed).length
  );

  const claimAchievement = createRequestRunner(async (id: string) => {
    await createRequest(client.achievements.claim.$post)({
      json: { id },
    });

    await invalidate("app:achievements");
  })


  const selectTitle = createRequestRunner(async (title: string | null) => {
    await createRequest(client.achievements["set-title"].$post)({
      json: { title },
    });

    await invalidate("app:character");
    await invalidate("app:achievements");
  })

</script>

<div class="h-full flex flex-col gap-2">
  <!-- Блок выбора титула -->
  <Card header="Титул персонажа" class="shrink-0">
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs">
        <span>Активный титул:</span>
        <span class="font-bold text-amber-300">
          {character().activeTitle ? `[${character().activeTitle}]` : "Нет титула"}
        </span>
      </div>

      {#if (character().unlockedTitles ?? []).length > 0}
        <div class="flex flex-wrap gap-1 mt-1">
          <Button
            {@attach selectTitle.attach({ disabled: () => !character().activeTitle}, null)}
            class="text-xs py-1 px-2 {character().activeTitle ? '' : 'is-primary'}"
          >
            Без титула
          </Button>

          {#each character().unlockedTitles ?? [] as title}
            <Button
              {@attach selectTitle.attach({}, title)}
              class="text-xs py-1 px-2 {character().activeTitle === title ? 'is-success' : ''}"
            >
              [{title}]
            </Button>
          {/each}
        </div>
      {:else}
        <p class="text-xs opacity-60 m-0">
          Выполняйте достижения, чтобы открыть уникальные титулы!
        </p>
      {/if}
    </div>
  </Card>

  <!-- Список достижений -->
  <Card
    // header={`Достижения (${completedCount}/${achievementsList.length})`}
    class="flex-1 flex flex-col"
  >
    <!-- Табы категорий -->
    <div class="flex overflow-x-auto gap-1 pb-1 mb-2 shrink-0">
      {#each categories as cat}
        <Button
          class="text-xs py-0.5 px-2 whitespace-nowrap {activeCategory === cat.key ? 'is-primary' : ''}"
          onclick={() => (activeCategory = cat.key)}
        >
          {cat.label}
        </Button>
      {/each}
    </div>

    <!-- Скроллируемый список -->
    <div class="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
      {#each filteredAchievements as ach (ach.id)}
        <div
          class="p-2 border-2 border-dashed {ach.completed
            ? ach.claimed
              ? 'border-neutral-700 bg-neutral-900/40 opacity-75'
              : 'border-amber-500 bg-amber-950/20'
            : 'border-neutral-800 bg-neutral-950/50'} flex flex-col gap-1.5"
        >
          <div class="flex justify-between items-start gap-2">
            <div class="flex items-center gap-1.5">
              <span class="text-base">{ach.icon ?? "🏆"}</span>
              <div>
                <div class="font-bold text-xs">{ach.title}</div>
                <div class="text-[11px] opacity-70">{ach.description}</div>
              </div>
            </div>

            <!-- Кнопка забрать / статус -->
            {#if ach.claimed}
              <span class="text-emerald-400 text-xs font-bold whitespace-nowrap">✓ Получено</span>
            {:else if ach.completed}
              <Button
                {@attach claimAchievement.attach({}, ach.id)}
                class="is-success text-xs py-1 px-2 animate-pulse whitespace-nowrap"
              >
                Забрать!
              </Button>
            {:else}
              <span class="text-[11px] opacity-50 whitespace-nowrap">
                {ach.progress}/{ach.maxProgress}
              </span>
            {/if}
          </div>

          <!-- Прогресс бар -->
          <div class="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-300 {ach.completed ? 'bg-amber-400' : 'bg-blue-500'}"
              style="width: {Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100))}%"
            ></div>
          </div>

          <!-- Награды -->
          <div class="flex items-center gap-2 text-[10px] opacity-80">
            <span>Награда:</span>
            {#if ach.reward.exp}
              <span class="text-amber-300">+{ach.reward.exp} XP</span>
            {/if}
            {#if ach.reward.gold}
              <span class="text-yellow-400">+{ach.reward.gold}💰</span>
            {/if}
            {#if ach.reward.titleReward}
              <span class="text-purple-400 font-bold">[{ach.reward.titleReward}]</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </Card>
</div>
