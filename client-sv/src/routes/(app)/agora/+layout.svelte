<script>
  import Card from "$lib/components/Card.svelte";

  let { children } = $props();
</script>

<Card header="Рынок" class="m-4">
  {@render children()}
</Card>
