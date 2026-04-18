<script lang="ts">
  import CharacterComponents from "$lib/character/components/CharacterComponents.svelte";
  import CharacterInventory from "$lib/character/components/CharacterInventory.svelte";
</script>

<div class="flex flex-col gap-4">
  <div>
    <h4>Компоненты</h4>
    <CharacterComponents />
  </div>
  <div>
    <h4>Экипировка</h4>
    <CharacterInventory />
  </div>
</div>
