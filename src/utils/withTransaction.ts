import { ClientSession, startSession } from 'mongoose';

export async function commitWithTransaction<T>(callback: (session: ClientSession) => Promise<T>) {
  const session = await startSession();
  const result = await session.withTransaction(async (session) => {
    const result = await callback(session);

    await session.commitTransaction();
    return result;
  })
    .finally(async () => {
      session.endSession();
    });
  return result;
}
