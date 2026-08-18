<script>
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { wearList, wearListTranslations } from "$lib/constants/item";
</script>

<Card header="Кузница" class="h-full flex flex-col">
  <h5 class="text-sm">
    Здесь ты можешь создать предметы. У предметов с уровня 2 появляется шанс
    неудачи при крафте. В клановой кузнице шанс успеха выше!
  </h5>

  <div class="flex-1 overflow-y-auto flex flex-col gap-2 mt-2">
    {#each wearList as wear (wear)}
      <Button href={`#/agora/forge/${wear}`}>
        {wearListTranslations[wear]}
      </Button>
    {/each}
  </div>
</Card>
