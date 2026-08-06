<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getSocketContext } from "$lib/constext/socket";
  import { getPopupContext } from "$lib/constext/popup";

  const socket = getSocketContext();
  const popup = getPopupContext()();

  let loading = $state(false);
  let error = $state<string | null>(null);
  let debuffLevel = $state(0);

  const handleEnterForest = async () => {
    loading = true;
    error = null;
    try {
      const res = await socket().emitWithAck('forest:enter');
      if (res.error) {
        error = res.message || 'Не удалось войти в лес';
      } else {
        goto(`/forest/${res.forestId}`);
      }
    } catch {
      error = 'Ошибка соединения';
    } finally {
      loading = false;
    }
  };

  onMount(async () => {
    const res = await socket().emitWithAck('forest:lobby');
    if (res.error) {
      popup.info({ message: res.error });
    } else {
      debuffLevel = res.debuffLevel ?? 0;
    }
  });
</script>

<div class="h-full overflow-hidden flex flex-col">
  <Card header="Лес">
    <div class="flex flex-col gap-2">
      <div class="flex flex-col">
        <p class="text-sm">
          Лес - это PvE режим, где ты можешь собирать ресурсы и сражаться с монстрами.
        </p>
        {#if debuffLevel}
          <p class="text-sm text-red-500">Ты ослаблен после смерти</p>
        {/if}
      </div>

      <div class="border-2 border-dashed p-2">
        <h5 class="mb-1 text-sm">Правила:</h5>
        <ul class="text-xs list-disc list-inside">
          <li>Здоровье сохраняется между боями</li>
          <li>Чем глубже ты пробираешься в лес - тем опаснее</li>
          <li>При смерти - дебафф на 1 час</li>
          <li>Любой выбор может обернуться неожиданным последствием</li>
        </ul>
      </div>

      <div class="border-2 border-dashed p-2">
        <h5 class="mb-1 text-sm">Награды:</h5>
        <ul class="text-xs list-disc list-inside">
          <li>🐺 Волк - кожа</li>
          <li>🌳 Дерево - доски</li>
          <li>⛺ Лагерь - ткань</li>
          <li>🪤 Капкан - железо</li>
          <li>⚔️ Меч - сталь</li>
          <li>💎 Кристалл - арканит</li>
          <li>📦 Сундук - золото</li>
          <li>🔥 Костёр - восстановление HP</li>
        </ul>
      </div>

      {#if error}
        <div class="text-red-500 text-sm text-center">{error}</div>
      {/if}
    </div>
  </Card>

  <div class="flex flex-col gap-2 mt-auto pb-8 px-4">
    <Button onclick={handleEnterForest} disabled={loading} class="is-primary">
      {loading ? 'Загрузка...' : 'Войти в лес'}
    </Button>
  </div>
</div>
