<script lang="ts">
  import { wearListTranslations } from "$lib/constants/item";
  import ForgeList from "$lib/forge/components/ForgeList.svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
</script>

<ForgeList
  items={data.items}
  title={wearListTranslations[data.wear] ?? "Клановая кузница"}
  clanForge={true}
/>
