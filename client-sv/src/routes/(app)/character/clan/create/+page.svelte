<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import Button from "$lib/components/Button.svelte";
  import { useClanCreate } from "$lib/clan/clan.svelte";

  const { createClan } = useClanCreate();
  let name = $state("");
</script>

<Card header="Создание клана">
  <input
    class="nes-input"
    bind:value={name}
    placeholder="Введите название клана"
  />

  <div class="mt-4 flex flex-col">
    <Button class="is-primary" onclick={() => createClan(name)}>
      Создать клан за 100💰
    </Button>
  </div>
</Card>
