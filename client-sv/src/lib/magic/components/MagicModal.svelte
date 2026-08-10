<script lang="ts">
  import type { Magic } from "@fwo/shared";

  import { getCharacterContext } from "$lib/constext/character";

  type Props = {
    magic: Magic;
  };

  const { magic }: Props = $props();

  const character = getCharacterContext();
  const currentLevel = $derived(character().magics?.[magic.name] ?? 0);
</script>

<div class="flex flex-col flex-1 justify-between">
  <div class="flex flex-col gap-2 mb-4">
    <span class="text-sm">{magic.description}</span>
    <div class="flex justify-between text-sm opacity-50">
      <span>Уровень</span>
      <span>{magic.lvl}</span>
    </div>
    <div class="flex justify-between text-sm opacity-50">
      <span>Стоимость</span>
      <span>💧{magic.cost}</span>
    </div>
    {#if currentLevel > 0}
      <div class="flex justify-between text-sm opacity-50">
        <span>Текущий уровень</span>
        <span>{currentLevel}</span>
      </div>
    {/if}
  </div>
</div>
