<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import LadderList from "$lib/ladder/components/LadderList.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Card header="Рейтинг" class="h-full flex flex-col">
  <div class="flex-1 overflow-y-auto">
    <LadderList ladderList={data.ladderList} />
  </div>
</Card>
