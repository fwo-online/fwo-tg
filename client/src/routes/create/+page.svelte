<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import CharacterImage from "$lib/character/components/CharacterImage.svelte";
  import { makeRequest } from "$lib/utils/make-request.svelte";
  import { client, createRequest } from "$lib/api";
  import { characterClassNameMap } from "$lib/constants/character";
  import { CharacterClass } from "@fwo/shared";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const characterClassList = Object.values(CharacterClass);

  let showCreateForm = $state(false);
  let selected = $state(0);
  let name = $state("");

  const next = () => {
    selected = (selected + 1) % characterClassList.length;
  };

  const prev = () => {
    selected =
      (selected - 1 + characterClassList.length) % characterClassList.length;
  };

  const onCreate = async () => {
    await makeRequest(async () => {
      const character = await createRequest(client.character.$post)({
        json: { name, class: characterClassList[selected] },
      });
      if (character) {
        window.location.href = "/";
      }
    });
  };

  const handleActivate = async (id: string) => {
    await makeRequest(async () => {
      await createRequest(client.character[":id"].activate.$patch)({
        param: { id },
      });
      window.location.reload();
    });
  };
</script>

{#if data.characters?.length === 0}
  <Card header="Создание персонажа" class="m-4!">
    <div class="flex justify-center gap-4 mb-4">
      {#each characterClassList as charClass, index}
        <div
          class={[
            "w-2 h-2 rounded-full",
            {
              "bg-(--tg-theme-accent-text-color)": index === selected,
              "bg-(--tg-theme-text-color)": index !== selected,
            },
          ]}
        ></div>
      {/each}
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <Button onclick={prev}>◄</Button>
        <div class="flex-1 flex justify-center">
          <div class="flex flex-col items-center">
            <CharacterImage characterClass={characterClassList[selected]} />
            <h2 class="text-xl font-semibold">
              {characterClassNameMap[characterClassList[selected]]}
            </h2>
          </div>
        </div>
        <Button onclick={next}>►</Button>
      </div>
      <input
        class="nes-input"
        bind:value={name}
        placeholder="Введите имя персонажа"
      />
      <Button class="is-primary" disabled={!name} onclick={onCreate}>
        Создать
      </Button>
    </div>
  </Card>
{:else}
  <Card header="Твои персонажи" class="m-4!">
    <div class="flex flex-col gap-2">
      {#each data.characters as char (char.id)}
        <div class="flex items-center justify-between">
          <div>
            <span class="font-semibold">{char.name}</span>
            <span class="text-sm opacity-50 ml-2">
              {characterClassNameMap[char.class]}
              {char.lvl} ур.
            </span>
          </div>
          {#if char.active}
            <Button href="#/character">Войти</Button>
          {:else}
            <Button onclick={() => handleActivate(char.id)}>Сменить</Button>
          {/if}
        </div>
      {/each}
    </div>
    {#if !showCreateForm}
      <div class="mt-4">
        <Button
          class="is-primary w-full"
          onclick={() => (showCreateForm = true)}
        >
          Создать нового
        </Button>
      </div>
    {/if}
  </Card>

  {#if showCreateForm}
    <Card header="Создание персонажа" class="m-4">
      <div class="flex justify-center gap-4 mb-4">
        {#each characterClassList as charClass, index}
          <div
            class={[
              "w-2 h-2 rounded-full",
              {
                "bg-(--tg-theme-accent-text-color)": index === selected,
                "bg-(--tg-theme-text-color)": index !== selected,
              },
            ]}
          ></div>
        {/each}
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <Button onclick={prev}>◄</Button>
          <div class="flex-1 flex justify-center">
            <div class="flex flex-col items-center">
              <CharacterImage characterClass={characterClassList[selected]} />
              <h2 class="text-xl font-semibold">
                {characterClassNameMap[characterClassList[selected]]}
              </h2>
            </div>
          </div>
          <Button onclick={next}>►</Button>
        </div>
        <input
          class="nes-input"
          bind:value={name}
          placeholder="Введите имя персонажа"
        />
        <Button class="is-primary" disabled={!name} onclick={onCreate}>
          Создать
        </Button>
      </div>
    </Card>
    <div class="mx-4 mb-4">
      <Button class="w-full" onclick={() => (showCreateForm = false)}
        >Отмена</Button
      >
    </div>
  {/if}
{/if}
