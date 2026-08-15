<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import LobbyList from "$lib/lobby/components/LobbyList.svelte";
  import { useLobbyQueue } from "$lib/lobby/useLobbyQueue.svelte";

  const { toggleSearch, isSearching, searchers } = useLobbyQueue('tower');
</script>

<div class="h-full overflow-hidden flex flex-col">
  <Card header="Башня">
    <div class="flex flex-col">
      <h5>Ищут игру</h5>
      <LobbyList {searchers} />
    </div>
  </Card>

  <div class="flex flex-col gap-2 mt-auto pb-8">
    {#if isSearching}
      <Button class="is-warning" onclick={toggleSearch}>
        Остановить поиск игры
      </Button>
    {:else}
      <Button onclick={toggleSearch}>Начать поиск игры</Button>
    {/if}
  </div>
</div>
