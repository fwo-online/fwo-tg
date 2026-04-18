<script>
  import Button from "$lib/components/Button.svelte";
  import { wearList, wearListTranslations } from "$lib/constants/item";
</script>

<h5 class="text-sm">
  Здесь ты можешь создать предметы. У предметов с уровня 2 появляется шанс
  неудачи при крафте. В клановой кузнице шанс успеха выше!
</h5>

<div class="flex flex-col gap-2">
  {#each wearList as wear (wear)}
    <Button href={`/agora/forge/${wear}`}>
      {wearListTranslations[wear]}
    </Button>
  {/each}
</div>
