<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import type { PopupOptions } from "$lib/constext/popup";
  import { themeParams, useSignal } from "@tma.js/sdk-svelte";
  import type { MouseEventHandler, SvelteHTMLElements } from "svelte/elements";

  const { children, ...restProps }: SvelteHTMLElements["dialog"] = $props();

  let dialog: HTMLDialogElement;
  let state = $state<PopupOptions | null>(null);
  const isDark = useSignal(themeParams.isDark);

  export const show = (options: PopupOptions) => {
    state = options;
    dialog?.showModal();
  };

  export const close = () => {
    dialog?.close();
    state = null;
  };

  export const info = (options: Omit<PopupOptions, "type">) =>
    show({ type: "info", ...options });

  export const confirm = (options: Omit<PopupOptions, "type">) =>
    show({ type: "confirm", ...options });

  const handleClick: MouseEventHandler<HTMLDialogElement> = (e) => {
    e.preventDefault();

    if (e.target === dialog) {
      dialog.close();
    } else {
      restProps.onclick?.(e);
    }
  };

  const handleConfirm = async () => {
    if (state?.onConfirm) {
      close();
      await state.onConfirm(close);
    } else {
      close();
    }
  };

  const handleCancel = () => {
    if (state?.onCancel) {
      close();
      state.onCancel();
    } else {
      close();
    }
  };
</script>

<dialog
  bind:this={dialog}
  class={[
    "nes-dialog is-rounded",
    {
      "is-dark": $isDark,
    },
  ]}
  onclick={handleClick}
  {...restProps}
>
  <div class="flex flex-col p-4 gap-4">
    {#if state?.title}
      <span class="font-semibold">{state.title}</span>
    {/if}

    {state?.message}
    {#if state?.type === "confirm"}
      <div class="flex gap-2">
        <Button class="flex-1" onclick={handleCancel}>Отмена</Button>
        <Button class="flex-1 is-primary" onclick={handleConfirm}>Ок</Button>
      </div>
    {:else if state?.type === "info"}
      <div class="flex gap-2">
        <Button class="flex-1 is-primary" onclick={handleConfirm}>Ок</Button>
      </div>
    {/if}
  </div>
</dialog>

<style>
  .nes-dialog {
    margin: auto;
    padding: 0;
    background-color: var(--tg-theme-secondary-bg-color);
    border-image-repeat: stretch !important;
    max-width: 85% !important;
    white-space: pre-wrap;
    min-width: 50vw;
  }
</style>
