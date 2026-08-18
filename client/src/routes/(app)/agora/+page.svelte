<script>
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
</script>

<Card header="Рынок">
  <div class="flex flex-col gap-2">
    <Button href="#/agora/forge">Кузница</Button>
    <Button href="#/agora/market">Барахолка</Button>
    <Button href="#/agora/service">Седой торговец</Button>
  </div>
</Card>
