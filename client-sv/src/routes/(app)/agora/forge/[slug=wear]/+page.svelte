<script lang="ts">
  import ForgeList from "$lib/forge/components/ForgeList.svelte";
  import { wearListTranslations } from "$lib/constants/item";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
</script>

<ForgeList
  items={data.items}
  title={wearListTranslations[data.wear] ?? "Кузница"}
  clanForge={false}
/>
