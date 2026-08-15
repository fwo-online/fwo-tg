<script lang="ts">
  import classNames from "classnames";
  import { themeParams, useSignal } from "@tma.js/sdk-svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  const getBorderSvg = (textColor: `#${string}` | undefined) => {
    const svg = `<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="5" height="5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h-1 z M1 2 h1 v1 h-1 z M3 2 h1 v1 h-1 z M2 3 h1 v1 h-1 z" fill="${textColor}" /></svg>`;

    return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
  };

  type Props = HTMLInputAttributes & {
    class?: string;
  };

  let {
    class: className,
    min = "0",
    max = "100",
    value = $bindable(),
    ...restProps
  }: Props = $props();

  const textColor = useSignal(themeParams.textColor);
  const progress = $derived(
    Number(max) === Number(min)
      ? 0
      : (Number(value) / (Number(max) - Number(min))) * 100,
  );
</script>

<input
  bind:value
  style:border-image-source={getBorderSvg($textColor)}
  style:--slider-progress={`${progress}%`}
  class={classNames("nes-slider nes-input", className)}
  {...restProps}
  {max}
  {min}
  type="range"
/>

<style>
  .nes-slider {
    position: relative;
    appearance: none;
    height: 4px;
    padding: 2px;
    border-image-repeat: stretch !important;
    cursor: pointer;
  }

  .nes-slider::-webkit-slider-thumb {
    position: relative;
    cursor: pointer;
    appearance: none;
    width: 20px;
    height: 32px;
    border: 4px solid var(--tg-theme-text-color);
    background-color: var(--tg-theme-button-color);
    z-index: 10;
  }

  .nes-slider::before {
    pointer-events: none;
    content: "";
    position: absolute;
    display: block;
    width: calc(100% - 4px);
    transform: scaleX(var(--slider-progress));
    transform-origin: left;
    height: 100%;
    background-color: var(--tg-theme-subtitle-text-color);
  }
</style>
