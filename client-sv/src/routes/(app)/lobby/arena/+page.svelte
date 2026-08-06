<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import LobbyList from "$lib/lobby/components/LobbyList.svelte";
  import { useLobbyQueue } from "$lib/lobby/useLobbyQueue.svelte";
  import { getSocketContext } from "$lib/constext/socket";
  import { onSocket } from "$lib/utils/on-socket";
  import { openTelegramLink } from "@tma.js/sdk-svelte";

  const { toggleSearch, isSearching, searchers } = useLobbyQueue('ladder');

  let channelLinkVisible = $state(false);

  const socket = getSocketContext();
  onSocket('lobby:help', () => {
    channelLinkVisible = true;
  });

  const openChannelLink = () => {
    openTelegramLink(import.meta.env.VITE_CHANNEL_URL || 'https://t.me/fwoarena');
  };
</script>

<div class="h-full overflow-hidden flex flex-col">
  <Card header="Арена">
    <div class="flex flex-col mb-8">
      <Button href="/lobby/ladder">Рейтинг</Button>
    </div>
    <div class="flex flex-col mt-4">
      <h5>Ищут игру</h5>
      <LobbyList {searchers} />
    </div>
  </Card>

  <div class="flex flex-col gap-2 mt-auto pb-8">
    {#if channelLinkVisible}
      <div class="flex flex-col">
        <h5 class="self-center px-4 text-center">
          Перейди в арену, чтобы видеть историю боя
        </h5>
        <Button class="is-error" onclick={openChannelLink}>
          Перейти в арену
        </Button>
      </div>
    {/if}
    {#if isSearching}
      <Button class="is-warning" onclick={toggleSearch}>
        Остановить поиск игры
      </Button>
    {:else}
      <Button onclick={toggleSearch}>Начать поиск игры</Button>
    {/if}
  </div>
</div>
