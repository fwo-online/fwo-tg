<script lang="ts">
  import ClanListItem from "./ClanListItem.svelte";
  import type { Clan } from "@fwo/shared";

  let {
    clans,
    isLoading,
    isRequested,
    onCreateRequest,
    onCancelRequest,
  }: {
    clans: Clan[];
    isLoading: boolean;
    isRequested: (clan: Clan) => boolean;
    onCreateRequest: (id: string) => void;
    onCancelRequest: (id: string) => void;
  } = $props();
</script>

<div class="flex flex-col gap-2">
  {#each clans as clan (clan.id)}
    <ClanListItem
      {clan}
      {isLoading}
      requested={isRequested(clan)}
      {onCreateRequest}
      {onCancelRequest}
    />
  {/each}
</div>
