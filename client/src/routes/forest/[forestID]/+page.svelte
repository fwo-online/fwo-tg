<script lang="ts">
  import { onMount } from "svelte";
  import {
    ForestEventAction,
    ForestEventType,
    ForestPhase,
    ForestState,
    type ForestStatus,
  } from "@fwo/shared";
  import { getSocket } from "$lib/constext/socket";
  import { getCharacterContext } from "$lib/constext/character";
  import { onSocket } from "$lib/utils/on-socket";
  import { goto } from "$app/navigation";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import Player from "$lib/lobby/components/Player.svelte";

  const EVENT_TITLES: Record<ForestEventType, string> = {
    [ForestEventType.Wolf]: "🐺 Волк!",
    [ForestEventType.FallenTree]: "🌳 Упавшее дерево",
    [ForestEventType.Chest]: "📦 Сундук",
    [ForestEventType.Campfire]: "🔥 Костёр",
    [ForestEventType.AbandonedCamp]: "⛺ Заброшенный лагерь",
    [ForestEventType.OldTrap]: "🪤 Старый капкан",
    [ForestEventType.AbandonedSword]: "⚔️ Заброшенный меч",
    [ForestEventType.OtherPlayer]: "⚔️ Другой игрок",
  };

  const EVENT_DESCRIPTIONS: Record<ForestEventType, string> = {
    [ForestEventType.Wolf]: "Ты заметил волка впереди. Что будешь делать?",
    [ForestEventType.FallenTree]:
      "Перед тобой упавшее дерево. Можно разрубить на доски.",
    [ForestEventType.Chest]: "Ты нашёл спрятанный сундук!",
    [ForestEventType.Campfire]: "Ты нашёл тлеющий костёр. Можно отдохнуть.",
    [ForestEventType.AbandonedCamp]:
      "Заброшенный лагерь охотников. Можно поискать полезное.",
    [ForestEventType.OldTrap]: "Старый ржавый капкан. Осторожно!",
    [ForestEventType.AbandonedSword]: "В земле торчит старый меч.",
    [ForestEventType.OtherPlayer]: "Ты встретился с другим игроком",
  };

  const ACTION_LABELS: Record<ForestEventAction, string> = {
    [ForestEventAction.PassBy]: "Пройти мимо",
    [ForestEventAction.AttackWolf]: "Атаковать",
    [ForestEventAction.Sneak]: "Прокрасться",
    [ForestEventAction.ChopTree]: "Разрубить",
    [ForestEventAction.OpenChest]: "Открыть",
    [ForestEventAction.Rest]: "Отдохнуть",
    [ForestEventAction.ScavengeCamp]: "Обыскать",
    [ForestEventAction.DisarmTrap]: "Разобрать",
    [ForestEventAction.TakeSword]: "Взять",
    [ForestEventAction.TakeCrystal]: "Взять",
    [ForestEventAction.Attack]: "Атаковать",
  };

  const PHASE_LABELS: Record<ForestPhase, string> = {
    [ForestPhase.Edge]: "🌿 Опушка",
    [ForestPhase.Wilds]: "🌲 Чаща",
    [ForestPhase.Deep]: "🌑 Глушь",
  };

  const socket = getSocket();
  const character = getCharacterContext();
  const name = $derived(character().name);
  const characterClass = $derived(character().class);

  let status = $state.raw<ForestStatus | null>(null);
  let lastResult = $state.raw<any>(null);
  let loading = $state(false);

  const isWaiting = $derived(status?.state === ForestState.Waiting);
  const isEvent = $derived(status?.state === ForestState.Event);

  onSocket("forest:end", (_reason, result) => {
    character().forest = undefined;
    goto("#/");
    // game result handled by game guard
  });

  onSocket("forest:updateStatus", (s) => {
    status = s;
  });

  onSocket("forest:eventResolved", (result) => {
    lastResult = result;
    loading = false;
  });

  onSocket("forest:battleStart", (gameID) => {
    goto(`#/game/${gameID}`);
  });

  const handleAction = async (action: ForestEventAction) => {
    loading = true;
    lastResult = null;
    const res = await socket.emitWithAck("forest:handleEvent", action);
    if (!res.error && res.result) {
      lastResult = res.result;
    }
    loading = false;
  };

  const handleExit = async () => {
    await socket.emitWithAck("forest:exit");
  };

  const clearLastResult = () => {
    lastResult = null;
  };

  onMount(async () => {
    const res = await socket.emitWithAck("forest:connect");
    if (res.error) {
      goto("#/");
    } else {
      status = res;
    }
  });
</script>

{#if !status}
  <Card header="Лес" class="m-4">
    <div class="text-center">Загрузка...</div>
  </Card>
{:else}
  <Card header="Лес" class="m-4">
    <div class="mb-4 p-2 border-2 border-dashed">
      <Player {name} {characterClass} />
      <div class="flex justify-between items-center">
        <span>❤️ HP:</span>
        <span>{status.status.hp} / {status.status.maxHP}</span>
      </div>
      <progress
        class="nes-progress is-error h-3"
        value={status.status.hp}
        max={status.status.maxHP}
      ></progress>
    </div>

    {#if lastResult}
      <div
        class={[
          "mb-4 p-2 border-2",
          {
            "border-green-500": lastResult.success,
            "border-red-500": !lastResult.success,
          },
        ]}
      >
        <p class="text-sm">{lastResult.message}</p>
        {#if lastResult.reward}
          <div class="text-xs mt-1">
            {#if lastResult.reward.gold}
              <span>+{lastResult.reward.gold} 💰</span>
            {/if}
            {#if lastResult.reward.hp > 0}
              <span class="ml-2">+{lastResult.reward.hp} ❤️</span>
            {/if}
            {#if lastResult.reward.hp < 0}
              <span class="ml-2 text-red-500">{lastResult.reward.hp} ❤️</span>
            {/if}
            {#if lastResult.reward.components}
              <span class="ml-2">
                {#each Object.entries(lastResult.reward.components) as [k, v]}
                  <span>+{v} {k}</span>
                {/each}
              </span>
            {/if}
          </div>
        {/if}
        {#if lastResult.resolved}
          <Button class="mt-2 text-xs" onclick={clearLastResult}>OK</Button>
        {/if}
      </div>
    {/if}

    {#if isWaiting && !lastResult}
      <div class="text-center py-8">
        <div class="text-xl mb-4">{PHASE_LABELS[status.phase]}</div>
        {#if status.escaping}
          <p>Ты ищешь выход из леса...</p>
        {:else}
          <p>Ты идёшь по лесу...</p>
        {/if}
        <p class="text-xs mt-2">Ожидание события</p>
      </div>
    {/if}

    {#if isEvent && status.currentEvent}
      <div class="text-center">
        <h3 class="text-lg mb-2">{EVENT_TITLES[status.currentEvent.type]}</h3>
        <p class="text-sm mb-4">
          {EVENT_DESCRIPTIONS[status.currentEvent.type]}
        </p>
        <div class="text-xs mb-4">
          Осталось времени: {Math.max(
            0,
            Math.ceil(
              (new Date(status.currentEvent.expiresAt).getTime() - Date.now()) /
                1000,
            ),
          )} сек
        </div>
        <div class="flex flex-col gap-2">
          {#each status.currentEvent.availableActions as action (action)}
            <Button
              onclick={() => handleAction(action)}
              disabled={loading}
              class={action === ForestEventAction.PassBy ? "" : "is-primary"}
            >
              {ACTION_LABELS[action]}
            </Button>
          {/each}
        </div>
      </div>
    {/if}

    {#if isWaiting && !status.escaping}
      <div class="mt-4">
        <Button onclick={handleExit} disabled={loading} class="w-full">
          Выйти из леса
        </Button>
      </div>
    {/if}
  </Card>
{/if}
