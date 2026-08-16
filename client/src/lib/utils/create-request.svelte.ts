import type { Attachment } from 'svelte/attachments';
import { popup } from '$lib/components/Popup/popup.svelte';
import { makeRequest } from '$lib/utils/make-request.svelte';

export const createRequestRunner = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  let pending = $state(false);

  const run = async (...args: Parameters<T>): Promise<ReturnType<Awaited<T>>> => {
    pending = true;
    return await makeRequest(() => fn(...args)).finally(() => {
      pending = false;
    });
  };

  const attach = (
    options?: {
      confirm?: string;
      disabled?: () => boolean;
    },
    ...args: Parameters<T>
  ): Attachment => {
    return (element) => {
      $effect(() => {
        const isDisabled = pending || (options?.disabled ? options.disabled() : false);

        if ('disabled' in element) {
          (element as HTMLButtonElement).disabled = pending;
        } else {
          if (isDisabled) {
            element.setAttribute('disabled', 'true');
            (element as HTMLButtonElement).style.pointerEvents = 'none';
          } else {
            element.removeAttribute('disabled');
            (element as HTMLButtonElement).style.pointerEvents = '';
          }
        }

        element.classList.toggle('is-disabled', isDisabled);
      });

      const handleClick = async (event: Event) => {
        event.preventDefault();

        const isDisabled = pending || (options?.disabled ? options.disabled() : false);
        if (isDisabled) {
          return;
        }

        // Показываем confirm, если передан текст
        if (options?.confirm) {
          const isConfirmed = await popup.confirmAsync({ message: options.confirm });
          if (!isConfirmed) {
            return;
          }
        }

        run(...args);
      };

      element.addEventListener('click', handleClick);

      return () => {
        element.removeEventListener('click', handleClick);
      };
    };
  };

  return {
    pending,
    run,
    attach,
  };
};
