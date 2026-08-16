<script lang="ts">
  import type { CharacterPublic } from "@fwo/shared";

  type Props = {
    character: CharacterPublic;
    position?: number;
    extraClass?: string;
  };

  let { character, position, extraClass }: Props = $props();
</script>

<div class={["flex flex-1", extraClass]}>
  <div class="basis-8">{position || "-"}</div>
  <div class="flex flex-col flex-1">
    <div class="flex justify-between mb-2">
      <div>{character.name}</div>
      <div>{character.psr}</div>
    </div>

    <div class="flex justify-between">
      <div class="flex gap-2">
        <div class="opacity-50">Игры</div>
        <div>{character.statistics.games}</div>
      </div>
      <div class="flex gap-2">
        <div class="opacity-50">Убийства</div>
        <div>{character.statistics.kills}</div>
      </div>
    </div>

    <div class="flex justify-between">
      <div class="flex gap-2">
        <div class="opacity-50">Победы</div>
        <div>{character.statistics.wins ?? "-"}</div>
      </div>
      <div class="flex gap-2">
        <div class="opacity-50">Смерти</div>
        <div>{character.statistics.death}</div>
      </div>
    </div>
  </div>
</div>
