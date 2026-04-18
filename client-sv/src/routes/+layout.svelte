<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import type { LayoutProps } from "./$types";
  import { setSocketContext } from "$lib/constext/socket";
  import { setCharactertContext } from "$lib/constext/character";
  import { setPopupContext } from "$lib/constext/popup";
  import Popup from "$lib/components/Popup.svelte";
  import { navigating } from "$app/state";

  import "./layout.css";

  let { children, data }: LayoutProps = $props();
  let popup: Popup;

  setSocketContext(() => data.socket);
  setCharactertContext(() => data.character);
  setPopupContext(() => popup);

  let showLoader = $state(true);
  let timeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (navigating.to) {
      timeout = setTimeout(() => {
        showLoader = true;
      }, 500);
    } else {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = null;
      showLoader = false;
    }
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if showLoader}
  <div
    class="fixed flex justify-center items-center z-10 inset-x-0 top-0 h-full bg-white/70"
  >
    Загрузка...
  </div>
{/if}

<Popup bind:this={popup} />

{@render children()}
