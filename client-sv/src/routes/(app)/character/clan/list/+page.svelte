<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import ClanList from "$lib/clan/components/ClanList.svelte";
  import { useClans } from "$lib/clan/clan.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const character = getCharacterContext();
  const { isLoading, createRequest, cancelRequest } = useClans();

  const isRequested = (clan: typeof data.clans[0]) => {
    return clan.requests.includes(character().id);
  };

  onMount(() => {
    if (character().clan) {
      goto("/character/clan");
    }
  });
</script>

{#if !character().clan}
  <div class="flex flex-col justify-between">
    <Card header="Кланы">
      {#if data.clans.length}
        <ClanList
          clans={data.clans}
          isLoading={isLoading}
          {isRequested}
          {createRequest}
          {cancelRequest}
        />
      {:else}
        Кланов не найдено
      {/if}
    </Card>

    <div class="flex flex-col p-4">
      <Button class="mt-4 is-primary" href="/character/clan/create">
        Создать клан
      </Button>
    </div>
  </div>
{/if}
