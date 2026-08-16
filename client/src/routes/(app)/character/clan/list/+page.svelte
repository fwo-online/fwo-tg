<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import ClanInfo from "$lib/clan/components/ClanInfo.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const character = getCharacterContext();

  let selectedClan = $derived(data.clans[0]);

  const isRequested = (clan: (typeof data.clans)[0]) => {
    return clan.requests.includes(character().id);
  };

  onMount(() => {
    if (character().clan) {
      goto("#/character/clan");
    }
  });
</script>

{#if !character().clan}
  <div class="h-full flex flex-col">
    <Card header="Кланы" class="mb-1">
      <div class="h-[30vh] overflow-y-auto">
        {#if data.clans.length}
          {#each data.clans as clan (clan.id)}
            <Button
              class={[
                "w-full text-left py-1! px-2!",
                { "is-primary": clan.id === selectedClan.id },
              ]}
              onclick={() => (selectedClan = clan)}
            >
              <div class="flex items-center justify-between text-xs">
                <span>{clan.name}</span>
                <div class="flex items-center gap-2">
                  <span class="opacity-75">{clan.lvl} ур.</span>
                  {#if isRequested(clan)}
                    <span class="text-yellow-400 font-semibold">Ожидание</span>
                  {/if}
                </div>
              </div>
            </Button>
          {/each}
        {:else}
          <div class="text-sm opacity-50">Кланов не найдено</div>
        {/if}
      </div>

      <div class="mt-2">
        <Button class="w-full is-primary py-1!" href="#/character/clan/create">
          Создать клан
        </Button>
      </div>
    </Card>

    <Card header={selectedClan?.name} class="flex-1 flex flex-col mt-0">
      {#if selectedClan}
        <ClanInfo clan={selectedClan} requested={isRequested(selectedClan)} />
      {:else}
        <div class="text-sm opacity-50">Выбери клан</div>
      {/if}
    </Card>
  </div>
{/if}
