<script lang="ts">
  import { getGameContext } from "$lib/constext/game";
  import type { Action } from "@fwo/shared";

  const game = getGameContext();
  let selectedAction: Action;
</script>
