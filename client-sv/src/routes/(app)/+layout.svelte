<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import { useGameGuard } from "$lib/hooks/useGameGuard.svelte";
  import { useBackButton } from "$lib/hooks/useBackButton.svelte";
  import { page } from "$app/state";
  import { useSettingsButton } from "$lib/hooks/useSettingsButton.svelte";

  let { children } = $props();

  const tabs = [
    {
      path: "/character",
      text: "Персонаж",
    },
    {
      path: "/lobby",
      text: "Мир",
    },
    {
      path: "/agora",
      text: "Рынок",
    },
  ];

  useBackButton();
  useSettingsButton();
  useGameGuard();
</script>

<div class="h-full overflow-hidden flex flex-col flex-1">
  <div class="overflow-auto flex-1">
    {@render children()}
  </div>
  <div class="gap-4 px-2 w-full flex">
    {#each tabs as tab (tab.path)}
      <Button
        href={tab.path}
        class={[
          "flex-1",
          {
            "is-primary": page.url.pathname.startsWith(tab.path),
          },
        ]}
      >
        {tab.text}
      </Button>
    {/each}
  </div>
</div>
