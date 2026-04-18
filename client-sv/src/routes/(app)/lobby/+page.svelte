<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import { towerRequiredLvl } from "@fwo/shared";

  const character = getCharacterContext();

  const { exp, lvl } = $derived(character());
</script>

<Card class="m-4">
  {#snippet header()}
    Мир
  {/snippet}

  <h5>Выбери место, куда хотел бы направиться</h5>
  <div class="flex flex-col gap-2">
    <Button href="/lobby/practice" class="flex-1">Тренировка</Button>
    <Button href="/lobby/arena" disabled={exp === 0} class="flex-1">
      Арена {exp === 0 ? "(требуется пройти тренировку)" : null}
    </Button>
    <Button
      href="/lobby/tower"
      disabled={lvl < towerRequiredLvl}
      class="flex-1"
    >
      Башня {lvl < towerRequiredLvl
        ? `(требуется ${towerRequiredLvl} ур.)`
        : null}
    </Button>
    <Button href="/lobby/forest" class="flex-1">Лес</Button>
  </div>
</Card>
