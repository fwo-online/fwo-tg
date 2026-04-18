<script lang="ts">
  import {
    renderable,
    type Renderable,
  } from "$lib/components/Renderable.svelte";
  import { themeParams, useSignal } from "@tma.js/sdk-svelte";
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  let {
    header,
    children,
    ...props
  }: { header?: Renderable; class?: ClassValue; children?: Snippet } = $props();
  const isDark = useSignal(themeParams.isDark);
</script>

{#snippet title(header: Renderable, classValue: ClassValue)}
  <text class={classValue} x="10" y="50%">
    {@render renderable(header)}
  </text>
{/snippet}

<div
  class={[
    "nes-container is-rounded p-2",
    { "with-title": !!header, "is-dark": $isDark },
    props.class,
  ]}
>
  {#if header}
    <svg viewBox="0 0 300 30" x="0" y="0" class="text-md font-semibold!">
      {@render title(header, "nes-container__outline")}
      {@render title(header, "nes-container__text")}
    </svg>
  {/if}
  {@render children?.()}
</div>

<style>
  .nes-container {
    border-image-outset: 2 !important;
    border-image-repeat: stretch !important;
    background-color: var(--tg-theme-secondary-bg-color);
  }

  .nes-container.with-title > svg {
    position: absolute;
    transform: translate(-12px, -24px);
    z-index: 1;
    font-size: 14px;
    font-weight: bold;
  }

  .nes-container.with-title .nes-container__outline {
    stroke: var(--tg-theme-secondary-bg-color);
    stroke-width: 6px;
    stroke-linejoin: round;
  }

  .nes-container.with-title .nes-container__text {
    fill: var(--tg-theme-text-color);
  }
</style>
