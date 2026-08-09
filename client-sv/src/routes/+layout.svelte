<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import type { LayoutProps } from "./$types";
  import { afterNavigate, beforeNavigate, goto } from "$app/navigation";
  import { setSocket } from "$lib/constext/socket";
  import { setCharactertContext } from "$lib/constext/character";
  import PopupHost from "$lib/components/Popup/PopupHost.svelte";

  import "./layout.css";

  let { children, data }: LayoutProps = $props();
  let redirecting = $state(false);

  if (!data.character) {
    redirecting = true;
    goto("/create", { replaceState: true }).finally(() => {
      redirecting = false;
    });
  }

  setSocket(data.socket);
  setCharactertContext(() => data.character);

  let showLoader = $state(true);
  let timeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    setSocket(data.socket);
  });

  beforeNavigate(() => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      showLoader = true;
    }, 500);
  });

  afterNavigate(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = null;
    showLoader = false;
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

<PopupHost />

{#if !redirecting}
  {@render children()}
{/if}
