<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import type { LayoutProps } from "./$types";
  import { goto } from "$app/navigation";
  import { navigating } from "$app/state";
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

  let showLoader = $state(false);
  let timeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    setSocket(data.socket);
  });

  $effect(() => {
    if (navigating.to) {
      timeout = setTimeout(() => {
        showLoader = true;
      }, 300);
    } else {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      showLoader = false;
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if showLoader}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div class="nes-container is-rounded is-dark p-3">
      <p class="mb-0 text-sm">Загрузка...</p>
    </div>
  </div>
{/if}

<PopupHost />

{#if !redirecting}
  {@render children()}
{/if}
