<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { useLobbyQueue } from "$lib/lobby/useLobbyQueue.svelte";

  const queue = useLobbyQueue("practice");
</script>

<Card header="Тренировка">
  <h5 class="mb-4">
    Безопасный режим для отработки приёмов и проверки снаряжения. Враги здесь не
    представляют серьёзной угрозы, но позволяют освоиться с боевой системой.
  </h5>
  <div class="flex flex-col">
    {#if queue.isSearching}
      <Button class="is-warning" onclick={queue.toggleSearch}>Отмена</Button>
    {:else}
      <Button onclick={queue.toggleSearch}>Начать тренировку</Button>
    {/if}
  </div>
</Card>
