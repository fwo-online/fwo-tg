<script lang="ts">
  import {
    renderable,
    type Renderable,
  } from "$lib/components/Renderable.svelte";
  import type { ClassValue } from "svelte/elements";

  const {
    disabled,
    children,
    after,
    selectable,
  }: {
    disabled?: boolean;
    children: Renderable;
    after?: Renderable;
    selectable?: boolean;
  } = $props();
</script>

<div
  class={[
    "flex items-center justify-between text-sm",
    {
      selectable: selectable && !disabled,
      "opacity-50": disabled,
    },
  ]}
>
  <span>
    {@render renderable(children)}
  </span>
  {#if after}
    <div>
      {@render renderable(after)}
    </div>
  {/if}
</div>

<style>
  .selectable {
    position: relative;
  }

  .selectable::after {
    content: "";
    position: absolute;
    inset: -2px;

    --s: 4px;
    --b: 2px;

    background:
      linear-gradient(#fff, #fff) left top / var(--s) var(--b) no-repeat,
      linear-gradient(#fff, #fff) left top / var(--b) var(--s) no-repeat,
      linear-gradient(#fff, #fff) right top / var(--s) var(--b) no-repeat,
      linear-gradient(#fff, #fff) right top / var(--b) var(--s) no-repeat,
      linear-gradient(#fff, #fff) left bottom / var(--s) var(--b) no-repeat,
      linear-gradient(#fff, #fff) left bottom / var(--b) var(--s) no-repeat,
      linear-gradient(#fff, #fff) right bottom / var(--s) var(--b) no-repeat,
      linear-gradient(#fff, #fff) right bottom / var(--b) var(--s) no-repeat;

    pointer-events: none;
    transform-origin: center;
    animation: corners 1s ease-in-out infinite;
  }
  @keyframes corners {
    0%,
    100% {
      opacity: 1;
      inset: 0px;
    }

    50% {
      opacity: 0.7;
      inset: -1px;
    }
  }
</style>
