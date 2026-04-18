<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  let { children } = $props();
</script>

<Card class="m-4">
  {#snippet header()}
    {document.title}
  {/snippet}

  {@render children()}
</Card>
