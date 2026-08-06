<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { wearList, wearListTranslations } from "$lib/constants/item";

  const handleClick = (wear: string) => {
    // navigate handled by Button href
  };
</script>

<Card header="Клановая кузница">
  <h5 class="text-sm">
    Здесь ты можешь создать предметы. Шанс создания редких предметов повышается с уровнем кузницы!
  </h5>

  <div class="flex flex-col gap-2">
    {#each wearList as wear (wear)}
      <Button class="flex justify-between" href={`/character/clan/forge/${wear}`}>
        {wearListTranslations[wear]}
      </Button>
    {/each}
  </div>
</Card>
