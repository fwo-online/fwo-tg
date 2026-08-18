<script lang="ts">
  import type { CharacterClass } from "@fwo/shared";
  import { themeParams, useSignal } from "@tma.js/sdk-svelte";
  import GamePlayer from "$lib/game/components/GamePlayer.svelte";

  let {
    value = $bindable(),
    id,
    characterClass,
    name,
    isBot,
    disabled = false,
  }: {
    characterClass: CharacterClass;
    name: string;
    isBot?: boolean;
    id: string;
    value: string | undefined;
    disabled?: boolean;
  } = $props();

  const isDark = useSignal(themeParams.isDark);
</script>

<label class="flex items-center gap-2 mb-0 cursor-pointer select-none">
  <input
    bind:group={value}
    value={id}
    class={["nes-radio", { "is-disabled": disabled, "is-dark": $isDark }]}
    type="radio"
    name="selectable-player"
    {disabled}
  />
  <span class="flex items-center">
    <GamePlayer {characterClass} {name} {isBot} />
  </span>
</label>

<style>
  .nes-radio:checked + span::before {
    top: 0px;
    align-self: center;
  }
</style>
