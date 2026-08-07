<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  let { children } = $props();
</script>

{#snippet header()}
  {document.title}
{/snippet}

{@render children()}
