export type RPC<Success extends object, Error extends object = { message: string }> =
  | (Success & {
      error?: false;
    })
  | (Error & { error: true });
