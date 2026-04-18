<script lang="ts">
  import { themeParams, useSignal } from "@tma.js/sdk-svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { Writable } from "svelte/store";

  type Props = SvelteHTMLElements["button"] & {
    href?: string;
  };

  const { children, ...props }: Props = $props();
  const textColor = useSignal(themeParams.textColor);
  const isDark = useSignal(themeParams.isDark);

  const getButtonSvg = (textColor: Writable<`#${string}` | undefined>) => {
    const svg = `<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="5" height="5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h-1 z M1 2 h1 v1 h-1 z M3 2 h1 v1 h-1 z M2 3 h1 v1 h-1 z" fill="${textColor}" /></svg>`;

    return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
  };
</script>

<svelte:element
  this={props.href ? "a" : "button"}
  {...props}
  style:border-image-source={getButtonSvg(textColor)}
  class={[
    "nes-btn",
    { "is-disabled": props.disabled, "is-dark": $isDark },
    props.class,
  ]}
>
  {@render children?.()}
</svelte:element>

<style>
  .nes-btn {
    border-image-repeat: stretch !important;
  }

  .nes-btn.is-dark:not(.is-primary):not(.is-success):not(.is-warning):not(
      .is-error
    ) {
    color: var(--tg-theme-text);
    background-color: var(--tg-theme-bg-color);
  }
</style>
