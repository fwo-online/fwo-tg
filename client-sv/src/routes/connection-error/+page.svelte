<script lang="ts">
  import { goto } from "$app/navigation";
  import ErrorPage from "../error/+page.svelte";
</script>

<ErrorPage error="Обнаружена активная сессия. Продолжите предыдущую сессию или завершите её и обновите страницу">
  {#snippet action()}
    <button class="nes-btn" onclick={() => window.location.reload()}>
      Перезагрузить
    </button>
  {/snippet}
</ErrorPage>
