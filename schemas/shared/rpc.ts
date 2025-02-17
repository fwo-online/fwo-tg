export type RPC<Success extends object, Error extends object> =
  | (Success & {
      error: false;
    })
  | (Error & { error: true });
