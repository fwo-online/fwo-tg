<script lang="ts">
  import { goto } from "$app/navigation";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  if (data.character) {
    goto("/character");
  }
</script>
