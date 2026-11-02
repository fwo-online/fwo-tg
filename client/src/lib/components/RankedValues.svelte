<script lang="ts">
  import type { ClassValue, HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLSpanElement> & {
    values: readonly (string | number)[];
    rank?: number;
    label?: string;
    unit?: string;
    separator?: string;
    activeClass?: ClassValue;
    inactiveClass?: ClassValue;
  };

  const {
    values,
    rank = 0,
    label,
    unit = '',
    separator = ' / ',
    activeClass = 'font-bold text-yellow-300',
    inactiveClass = 'opacity-65',
    class: className,
    ...props
  }: Props = $props();

  const activeIndex = $derived(
    rank > 0 && values.length > 0 ? Math.min(rank - 1, values.length - 1) : -1,
  );
</script>

{#if values.length > 0}
  <span {...props} class={className}>
    {#if label}
      <span class={inactiveClass}>{label}: </span>
    {/if}
    {#each values as value, index (index)}
      {#if index > 0}
        <span class={inactiveClass}>{separator}</span>
      {/if}
      <span class={index === activeIndex ? activeClass : inactiveClass}>{value}</span>
    {/each}{#if unit}<span class={inactiveClass}>{unit}</span>{/if}
  </span>
{/if}
