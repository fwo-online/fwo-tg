<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { makeRequest } from "$lib/utils/make-request.svelte";
  import { client, createRequest } from "$lib/api";
  import { invalidate } from "$app/navigation";
  import { InvoiceType, invoiceTypes } from "@fwo/shared";
  import { invoice } from "@tma.js/sdk-svelte";
  import { popup } from "$lib/components/Popup/popup.svelte";

  let resetLoading = $state(false);
  let nameLoading = $state(false);
  let donateLoading = $state(false);
  let nickname = $state("");
  let donateAmount = $state("50");

  // Reset attributes
  const resetAttributesByStars = async () => {
    resetLoading = true;
    await makeRequest(async () => {
      const inv = await createRequest(
        client.serviceShop["reset-attributes"].invoice.$post,
      )({});
      if (inv?.url) {
        const status = await invoice.openUrl(inv.url);
        if (status === "paid") {
          await invalidate("app:character");
          popup.info({ message: "Характеристики успешно сброшены" });
        }
      }
    });
    resetLoading = false;
  };

  const resetAttributesByComponents = () => {
    popup.confirm({
      message: "Вы уверены, что хотите сбросить характеристики?",
      onConfirm: async () => {
        resetLoading = true;
        const res = await makeRequest(() =>
          createRequest(client.serviceShop["reset-attributes"].$post)({}),
        );
        if (res) {
          popup.info({ message: "Характеристики успешно сброшены" });
          await invalidate("app:character");
        }
        resetLoading = false;
      },
    });
  };

  // Change name
  const changeNameByStars = async () => {
    if (!nickname) return;
    nameLoading = true;
    await makeRequest(async () => {
      const inv = await createRequest(
        client.serviceShop["change-name"].invoice.$post,
      )({ json: { name: nickname } });
      if (inv?.url) {
        const status = await invoice.openUrl(inv.url);
        if (status === "paid") {
          await invalidate("app:character");
          popup.info({ message: "Имя успешно изменено" });
        }
      }
    });
    nameLoading = false;
  };

  const changeNameByComponents = () => {
    if (!nickname) return;
    popup.confirm({
      message: "Вы уверены, что хотите изменить имя?",
      onConfirm: async () => {
        nameLoading = true;
        const res = await makeRequest(() =>
          createRequest(client.serviceShop["change-name"].$post)({
            json: { name: nickname },
          }),
        );
        if (res) {
          await invalidate("app:character");
          popup.info({ message: "Имя успешно изменено" });
        }
        nameLoading = false;
      },
    });
  };

  // Donation
  const donateByStars = async () => {
    const amount = Number(donateAmount);
    if (Number.isNaN(amount) || !amount) return;
    donateLoading = true;
    await makeRequest(async () => {
      const inv = await createRequest(client.serviceShop.donate.invoice.$post)({
        json: { amount },
      });
      if (inv?.url) {
        const status = await invoice.openUrl(inv.url);
        if (status === "paid") {
          await invalidate("app:character");
          popup.info({ message: "Пожертвование успешно отправлено!" });
        }
      }
    });
    donateLoading = false;
  };

  const resetCfg = invoiceTypes[InvoiceType.ResetAttributes];
  const nameCfg = invoiceTypes[InvoiceType.ChangeName];
  const donateCfg = invoiceTypes[InvoiceType.Donation];
</script>

<Card header="Седой торговец">
  <h5 class="mb-4">Продавец необычных услуг и уникальных возможностей</h5>

  <div class="flex flex-col gap-8">
    <Card header={resetCfg.title}>
      <div class="flex gap-2">
        <Button
          class="flex-1"
          disabled={resetLoading}
          onclick={resetAttributesByComponents}
        >
          <div class="flex justify-center">
            {resetCfg.components.arcanite} 🪨
          </div>
        </Button>
        <Button
          class="flex-1"
          disabled={resetLoading}
          onclick={resetAttributesByStars}
        >
          {resetCfg.stars}⭐
        </Button>
      </div>
    </Card>

    <Card header={nameCfg.title}>
      <div class="flex flex-col gap-2">
        <input
          class="nes-input"
          placeholder="Введите имя"
          bind:value={nickname}
        />
        <div class="flex gap-2">
          <Button
            class="flex-1"
            disabled={nameLoading || !nickname}
            onclick={changeNameByComponents}
          >
            <div class="flex justify-center">
              {nameCfg.components.arcanite} 🪨
            </div>
          </Button>
          <Button
            class="flex-1"
            disabled={nameLoading || !nickname}
            onclick={changeNameByStars}
          >
            {nameCfg.stars}⭐
          </Button>
        </div>
      </div>
    </Card>

    <Card header={donateCfg.title}>
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
          <Button
            class="flex-1"
            disabled={donateLoading || !donateAmount}
            onclick={donateByStars}
          >
            {donateAmount}⭐
          </Button>
        </div>
      </div>
    </Card>
  </div>
</Card>
