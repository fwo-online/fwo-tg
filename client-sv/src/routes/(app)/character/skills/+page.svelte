<script lang="ts">
  import type { PageProps } from "./$types";
  import SkillModal from "$lib/skill/components/SkillModal.svelte";

  const { data }: PageProps = $props();
</script>

<div class="flex flex-col gap-2">
  {#each data.skills as skill (skill.name)}
    <SkillModal {skill} />
  {/each}
</div>
