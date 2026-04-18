<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { getPopupContext } from "$lib/constext/popup";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const popup = getPopupContext();
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the
  documentation
</p>

<a href="/character">test</a>
<button
  onclick={() =>
    popup().info({ title: "Info", message: "This is an info message." })}
>
  test2
</button>

<button onclick={() => invalidate("app:character")}> test3 </button>
