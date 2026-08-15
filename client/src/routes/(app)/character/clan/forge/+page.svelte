<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { wearList, wearListTranslations } from "$lib/constants/item";
</script>

<Card header="Клановая кузница" class="h-full flex flex-col">
  <h5 class="text-sm">
    Здесь ты можешь создать предметы. Шанс создания редких предметов повышается
    с уровнем кузницы!
  </h5>

  <div class="flex-1 overflow-y-auto flex flex-col gap-2 mt-2">
    {#each wearList as wear (wear)}
      <Button href={`/character/clan/forge/${wear}`}>
        {wearListTranslations[wear]}
      </Button>
    {/each}
  </div>
</Card>
