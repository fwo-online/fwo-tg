<script lang="ts">
  import Popup from "$lib/components/Popup.svelte";
  import { type Renderable } from "$lib/components/Renderable.svelte";
  import type { Snippet } from "svelte";

  type PopupOptions = {
    title?: string;
    message: Renderable;
    onConfirm?: (done: () => void) => void;
    onCancel?: () => void;
    type?: "confirm" | "info";
  };

  let popup: Popup;
</script>

<Popup bind:this={popup}></Popup>
