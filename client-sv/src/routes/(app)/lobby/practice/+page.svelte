<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { useLobbyQueue } from "$lib/lobby/useLobbyQueue.svelte";

  const { isSearching, toggleSearch } = useLobbyQueue("practice");
</script>

<div class="h-full overflow-hidden flex flex-col">
  <Card class="m-4">
    {#snippet header()}
      Тренировка
    {/snippet}
    <h5 class="mb-4">
      Безопасный режим для отработки приёмов и проверки снаряжения. Враги здесь
      не представляют серьёзной угрозы, но позволяют освоиться с боевой
      системой.
    </h5>
    <div class="flex flex-col">
      {#if isSearching}
        <Button class="is-warning" onclick={toggleSearch}>Отмена</Button>
      {:else}
        <Button onclick={toggleSearch}>Начать тренировку</Button>
      {/if}
    </div>
  </Card>
</div>
