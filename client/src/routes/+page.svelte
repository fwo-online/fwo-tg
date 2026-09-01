<script lang="ts">
  import { goto } from "$app/navigation";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  // svelte-ignore state_referenced_locally
  if (data.character) {
    goto("#/character");
  }
</script>
