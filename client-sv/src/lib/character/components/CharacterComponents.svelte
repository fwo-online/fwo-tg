<script>
  import { components, componentsImageMap } from "$lib/constants/components";
  import { getCharacterContext } from "$lib/constext/character";

  const character = getCharacterContext();

  const characterComponents = $derived(character().components);
</script>

<div class="grid grid-cols-3 gap-1">
  {#each components as component (component)}
    <div
      class={[
        "flex items-center gap-4 text-sm",
        !characterComponents[component] && "opacity-50",
      ]}
    >
      <img height={20} width={20} src={componentsImageMap[component]} />
      <span>{characterComponents[component] ?? 0}</span>
    </div>
  {/each}
</div>
