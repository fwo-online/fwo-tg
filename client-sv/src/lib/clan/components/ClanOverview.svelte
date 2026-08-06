<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import ClanPlayers from "./ClanPlayers.svelte";
  import type { CharacterPublic } from "@fwo/shared";
  import { useClanOwner, useClanLvl, useClanGold, useClanForgeOpen, useClanRequest } from "../clan.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { client, createRequest } from "$lib/api";
  import DescriptionGroup from "$lib/components/Description/description-group.svelte";
  import DescriptionItem from "$lib/components/Description/description-item.svelte";
  import { clanLvlCost } from "@fwo/shared";

  let {
    clan,
    players,
    requests,
  }: {
    clan: { name: string; lvl: number; forge: { lvl: number; active: boolean }; players: string[]; maxPlayers: number; requests: string[]; owner: string; channel?: string; gold: number };
    players: CharacterPublic[];
    requests: CharacterPublic[];
  } = $props();

  const { isOwner } = useClanOwner();
  const { upgradeLvl } = useClanLvl();
  const { addGold } = useClanGold();
  const { openForge } = useClanForgeOpen();
  const { acceptRequest, rejectRequest } = useClanRequest();

  let adding = $state(false);
  let goldToAdd = $state("");

  const handleAddGold = () => {
    const goldNumber = Number(goldToAdd);
    if (!Number.isNaN(goldNumber) && goldNumber) {
      addGold(goldNumber);
      adding = false;
      goldToAdd = "";
    }
  };
</script>

<div class="flex flex-col gap-4">
  <div class="flex justify-between items-center">
    <h5>Уровень {clan.lvl}</h5>
    {#if isOwner && clan.lvl < clanLvlCost.length}
      <Button onclick={() => upgradeLvl(clan.lvl)}>Повысить уровень</Button>
    {/if}
  </div>

  <div>
    <h5 class="-mb-3">Казна</h5>
    <div class="flex justify-between items-center">
      {clan.gold}💰
      <div class="flex items-center gap-2">
        {#if adding}
          <input
            class="nes-input w-26 h-11"
            type="number"
            inputmode="numeric"
            min="0"
            bind:value={goldToAdd}
            placeholder="Золото"
          />
          <div class="flex gap-4">
            <Button class="is-success" disabled={!goldToAdd} onclick={handleAddGold}>✔</Button>
            <Button class="is-error" onclick={() => adding = false}>✖</Button>
          </div>
        {:else}
          <Button onclick={() => adding = true}>Пополнить</Button>
        {/if}
      </div>
    </div>
  </div>

  <div class="flex justify-between items-center">
    <h5>Кузница {clan.forge.lvl} ур.</h5>
    {#if clan.forge.active}
      <Button href="/character/clan/forge">Перейти в кузницу</Button>
    {:else if isOwner}
      <Button onclick={openForge}>Открыть кузницу</Button>
    {:else}
      <Button href="/character/clan/forge" disabled>Перейти в кузницу</Button>
    {/if}
  </div>

  <div>
    <h5>Игроки {players.length}/{clan.maxPlayers}</h5>
    <ClanPlayers characters={players} />
  </div>

  {#if !isOwner}
    <div>
      <h5>Владелец</h5>
      <ClanPlayers characters={players.filter(({ id }) => id === clan.owner)} />
    </div>
  {/if}

  {#if isOwner && requests.length > 0}
    <div>
      <h5 class="-mb-3">Заявки</h5>
      <DescriptionGroup>
        {#each requests as requester (requester.id)}
          <DescriptionItem>
            <div class="flex gap-2 items-center">
              {requester.name} ({requester.lvl})
            </div>
            {#snippet after()}
              <div class="flex gap-2">
                <Button class="is-success" onclick={() => acceptRequest(requester)}>✔</Button>
                <Button class="is-error" onclick={() => rejectRequest(requester)}>✖</Button>
              </div>
            {/snippet}
          </DescriptionItem>
        {/each}
      </DescriptionGroup>
    </div>
  {/if}

  {#if clan.channel}
    <div class="flex gap-2 items-center">
      <h5>Канал привязан</h5>
      <Button>!</Button>
      {#snippet popupContent()}
        Для отвязки бота используйте команду <code>/clan unlink</code> в канале с ботом
      {/snippet}
    </div>
  {:else}
    <div class="flex gap-2 items-center">
      <h5>Канал не привязан</h5>
      <Button>!</Button>
      {#snippet popupContent()}
        Для привязки канала добавьте бота в канал и используйте команду <code>/clan link</code> в канале
      {/snippet}
    </div>
  {/if}
</div>
