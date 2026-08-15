<script lang="ts">
  import ClanPlayers from "./ClanPlayers.svelte";
  import type { CharacterPublic, Clan } from "@fwo/shared";
  import { client, createRequest } from "$lib/api";
  import Button from "$lib/components/Button.svelte";
  import { cancelClanRequest, createClanRequest } from "$lib/clan/clan.svelte";

  type Props = {
    clan: Clan;
    requested?: boolean;
  };

  let { clan, requested = false }: Props = $props();

  let characters = $state.raw<CharacterPublic[]>([]);
  let isCharactersLoading = $state(false);

  const owner = $derived(
    characters?.filter(({ id }) => id === clan.owner) ?? [],
  );

  $effect(() => {
    const playerIds = clan.players;
    isCharactersLoading = true;
    createRequest(client.character.list.$get)({
      query: { ids: playerIds },
    })
      .then((res) => {
        if (res) characters = res;
      })
      .finally(() => {
        isCharactersLoading = false;
      });
  });
</script>

<div class="flex flex-col flex-1 justify-between gap-3">
  <div class="flex flex-col gap-2">
    <div class="text-xs opacity-75">
      Уровень: <span class="font-semibold">{clan.lvl}</span>
    </div>

    <div>
      <h5 class="text-xs font-semibold mb-1">Владелец</h5>
      {#if isCharactersLoading}
        <span class="text-xs opacity-50">Загружаем владельца...</span>
      {:else}
        <ClanPlayers characters={owner} />
      {/if}
    </div>

    <div>
      <h5 class="text-xs font-semibold mb-1">Игроки ({clan.players.length})</h5>
      {#if isCharactersLoading}
        <span class="text-xs opacity-50">Загружаем игроков...</span>
      {:else}
        <div class="max-h-32 overflow-y-auto">
          <ClanPlayers {characters} />
        </div>
      {/if}
    </div>
  </div>

  <div class="mt-2">
    {#if requested}
      <Button
        class="is-primary w-full py-1.5!"
        disabled={cancelClanRequest.pending}
        onclick={() => cancelClanRequest.run(clan.id)}
      >
        Отменить заявку
      </Button>
    {:else}
      <Button
        class="is-primary w-full py-1.5!"
        disabled={createClanRequest.pending}
        onclick={() => createClanRequest.run(clan.id)}
      >
        Отправить заявку
      </Button>
    {/if}
  </div>
</div>
