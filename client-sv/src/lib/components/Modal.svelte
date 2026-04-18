<script lang="ts">
  import type { Snippet } from "svelte";
  import { BottomSheet } from "svelte-bottom-sheet";
  import Card from "$lib/components/Card.svelte";

  type Props = {
    trigger: Snippet;
    children: Snippet;
    header?: Snippet;
  };
  const { trigger, children, header }: Props = $props();
</script>

<BottomSheet settings={{ maxHeight: 0.7, snapPoints: [] }}>
  <BottomSheet.Trigger>
    {@render trigger()}
  </BottomSheet.Trigger>
  <BottomSheet.Overlay>
    <BottomSheet.Sheet>
      <BottomSheet.Content>
        <Card class="w-[calc(100vw-8px)]">
          {#snippet header()}
            {@render header?.()}
          {/snippet}
          {@render children()}
        </Card>
      </BottomSheet.Content>
    </BottomSheet.Sheet>
  </BottomSheet.Overlay>
</BottomSheet>

<style>
  :global(.bottom-sheet) {
    background-color: transparent !important;
  }

  :global(.bottom-sheet-content) {
    padding: 8px 0 !important;
  }
</style>
