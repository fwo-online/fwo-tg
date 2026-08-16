<script lang="ts">
  import { getCharacterContext } from "$lib/constext/character";
  import { formatNumber } from "$lib/utils/format-number";

  const character = getCharacterContext();
  const exp = $derived(character().exp);
  const nextLvlExp = $derived(character().nextLvlExp);
  const progress = $derived(Math.ceil((exp / nextLvlExp) * 100));
</script>

<div style="--exp-progress: {progress}%" class="exp">
  {formatNumber(exp)}/{formatNumber(nextLvlExp)}
</div>

<style>
  .exp {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding-inline: 4px;
  }

  .exp::before {
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    content: "";
    background: var(--tg-theme-accent-text-color);
    box-shadow: inset 0 -4px #006bb3;
    transform: scaleX(var(--exp-progress));
    transform-origin: left;
  }
</style>
