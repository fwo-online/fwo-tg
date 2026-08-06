<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Card from "$lib/components/Card.svelte";
  import ClanOverview from "$lib/clan/components/ClanOverview.svelte";
  import { clanStore } from "$lib/clan/clan.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  // loader data doesn't change — direct assignment is fine
  if (data.clan) {
    clanStore.clan = data.clan;
  }

  onMount(() => {
    if (!data.clan) {
      goto("/character/clan/list");
    }
  });
</script>

{#if data.clan}
  <Card header={data.clan.name}>
    <ClanOverview
      clan={data.clan}
      players={data.players}
      requests={data.requests}
    />
  </Card>
{/if}
