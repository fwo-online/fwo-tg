<script lang="ts">
  import type { CharacterPublic } from "@fwo/shared";
  import { playersClanName } from "@fwo/shared";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { getSocket } from "$lib/constext/socket";
  import Player from "$lib/lobby/components/Player.svelte";
  import { onSocket } from "$lib/utils/on-socket";

  const socket = getSocket();
  const character = getCharacterContext();
  const characterID = character().id;

  let players = $state.raw<Record<string, CharacterPublic>>({});
  let timeSpent = $state(0);
  let timeLeft = $state(0);
  let acceptedList = $state.raw<string[]>([]);
  let accepted = $derived(acceptedList.includes(characterID));

  onSocket("tower:end", async () => {
    character().tower = undefined;
    await goto("#/");
  });

  onSocket("tower:updateTime", (t: number, l: number) => {
    timeSpent = t;
    timeLeft = l;
  });

  const handleAccept = async () => {
    const res = await socket.emitWithAck("tower:accept", !accepted);
    if (!res.error) {
      acceptedList = res.accepted;
    }
  };

  onMount(async () => {
    const res = await socket.emitWithAck("tower:connected");
    if (!res.error) {
      players = res.players;
      acceptedList = res.accepted;
      timeSpent = res.timeSpent;
      timeLeft = res.timeLeft;
    } else {
      goto("#/");
    }
  });
</script>

<Card header="Башня">
  <div class="flex flex-col mb-12">
    <h5>{playersClanName}</h5>
    {#each Object.entries(players) as [id, player] (id)}
      <Player
        characterClass={player.class}
        name={player.name}
        lvl={player.lvl}
      />
      {#if acceptedList.includes(player.id)}
        <span class="opacity-50">✓</span>
      {/if}
    {/each}
  </div>

  <div class="flex flex-col gap-2 mt-auto">
    <span>Стадия подготовки</span>
    <h5 class="text-sm">
      У вас есть 2 минуты на планирование. Подтвердите готовность, чтобы начать
      бой раньше
    </h5>
    <progress
      class="nes-progress h-4"
      value={timeSpent}
      max={timeLeft + timeSpent}
    ></progress>
    <Button
      class={accepted ? "is-warning" : "is-success"}
      onclick={handleAccept}
    >
      {accepted ? "Не готов" : "Готов"}
    </Button>
  </div>
</Card>
