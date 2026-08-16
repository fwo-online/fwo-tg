<script lang="ts">
  import { InvoiceType, invoiceTypes, ItemComponent } from "@fwo/shared";
  import { invalidate } from "$app/navigation";
  import { invoice } from "@tma.js/sdk-svelte";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { client, createRequest } from "$lib/api";
  import { popup } from "$lib/components/Popup/popup.svelte";
  import { componentsImageMap } from "$lib/constants/components";
  import { createRequestRunner } from "$lib/utils/create-request.svelte";
  import type { Attachment } from "svelte/attachments";

  let nickname = $state("");
  let donateAmount = $state("50");

  const resetAttributesByStars = createRequestRunner(async () => {
    const res = await createRequest(
      client.serviceShop["reset-attributes"].invoice.$post,
    )({});

    if (!res?.url) {
      return;
    }

    const status = await invoice.openUrl(res.url);
    if (status === "paid") {
      await invalidate("app:character");
      popup.info({ message: "Характеристики успешно сброшены" });
    }
  });

  const resetAttributesByComponents = createRequestRunner(async () => {
    await createRequest(client.serviceShop["reset-attributes"].$post)({});

    popup.info({ message: "Характеристики успешно сброшены" });
    await invalidate("app:character");
  });

  const changeNameByStars = createRequestRunner(async () => {
    const res = await createRequest(
      client.serviceShop["change-name"].invoice.$post,
    )({ json: { name: nickname } });

    if (!res?.url) {
      return;
    }

    const status = await invoice.openUrl(res.url);
    if (status === "paid") {
      await invalidate("app:character");
      popup.info({ message: "Имя успешно изменено" });
    }
  });

  const changeNameByComponents = createRequestRunner(async () => {
    const res = await createRequest(client.serviceShop["change-name"].$post)({
      json: { name: nickname },
    });

    if (res) {
      await invalidate("app:character");
      popup.info({ message: "Имя успешно изменено" });
    }
  });

  const donateByStars = createRequestRunner(async () => {
    const amount = Number(donateAmount);
    if (Number.isNaN(amount) || !amount) {
      return;
    }

    const inv = await createRequest(client.serviceShop.donate.invoice.$post)({
      json: { amount },
    });

    if (!inv?.url) {
      return;
    }

    const status = await invoice.openUrl(inv.url);
    if (status === "paid") {
      await invalidate("app:character");
      popup.info({ message: "Пожертвование успешно отправлено!" });
    }
  });

  const resetCfg = invoiceTypes[InvoiceType.ResetAttributes];
  const nameCfg = invoiceTypes[InvoiceType.ChangeName];
  const donateCfg = invoiceTypes[InvoiceType.Donation];
</script>

{#snippet arcanitesButton(cost: number | string, attachment: Attachment)}
  <Button {@attach attachment} class="flex-1">
    <div class="flex justify-center">
      {cost}
      <img
        height="20"
        width="20"
        src={componentsImageMap[ItemComponent.Arcanite]}
        alt={ItemComponent.Arcanite.toString()}
      />
    </div>
  </Button>
{/snippet}

{#snippet starsButton(cost: number | string, attachment: Attachment)}
  <Button {@attach attachment} class="flex-1">
    {cost}⭐
  </Button>
{/snippet}

<Card header="Седой торговец" class="h-full flex flex-col">
  <h5 class="mb-2 text-sm">
    Продавец необычных услуг и уникальных возможностей
  </h5>

  <div class="flex-1 overflow-y-auto flex flex-col gap-4 mt-2 pt-2">
    <Card header={resetCfg.title} class="mt-0">
      <div class="flex gap-2">
        {@render arcanitesButton(
          resetCfg.components.arcanite,
          resetAttributesByComponents.attach({
            confirm: "Вы уверены, что хотите сбросить характеристики?",
          }),
        )}
        {@render starsButton(resetCfg.stars, resetAttributesByStars.attach())}
      </div>
    </Card>

    <Card header={nameCfg.title} class="mt-0">
      <div class="flex flex-col gap-2">
        <input
          class="nes-input"
          placeholder="Введите имя"
          bind:value={nickname}
        />
        <div class="flex gap-2">
          {@render arcanitesButton(
            nameCfg.components.arcanite,
            changeNameByComponents.attach({
              confirm: "Вы уверены, что хотите изменить имя?",
              disabled: () => !nickname,
            }),
          )}
          {@render starsButton(
            nameCfg.stars,
            changeNameByStars.attach({
              disabled: () => !nickname,
            }),
          )}
        </div>
      </div>
    </Card>

    <Card header={donateCfg.title} class="mt-0">
      <h5>
        Ваше имя будет периодически появляться в боевом чате и навсегда
        останется в наших сердцах!
      </h5>
      <div class="flex flex-col gap-2">
        <input
          class="nes-input"
          placeholder="Введите количество"
          inputmode="numeric"
          type="number"
          min="50"
          bind:value={donateAmount}
        />
        <div class="flex gap-2">
          {@render starsButton(donateAmount, donateByStars.attach())}
        </div>
      </div>
    </Card>
  </div>
</Card>
