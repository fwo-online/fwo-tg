<script lang="ts">
  import PassiveSkillModal from "$lib/passive-skill/components/PassiveSkillModal.svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
</script>

<div class="flex flex-col gap-2">
  {#each data.passiveSkills as skill (skill.name)}
    <PassiveSkillModal {skill} />
  {/each}
</div>
