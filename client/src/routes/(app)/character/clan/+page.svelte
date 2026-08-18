<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import ClanOverview from "$lib/clan/components/ClanOverview.svelte";
  import Card from "$lib/components/Card.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  onMount(() => {
    if (!data.clan) {
      goto("#/character/clan/list");
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
