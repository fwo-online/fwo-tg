<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import LadderList from "$lib/ladder/components/LadderList.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Card header="Рейтинг">
  <LadderList ladderList={data.ladderList} />
</Card>
