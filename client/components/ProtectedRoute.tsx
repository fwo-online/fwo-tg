import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/shared';
import {
  createContext,
  type LoaderFunctionArgs,
  type MiddlewareFunction,
  Navigate,
  Outlet,
  redirect,
  useLoaderData,
} from 'react-router';
import type { Socket } from 'socket.io-client';
import { createWebSocket } from '@/api';
import { getCharacter } from '@/api/character';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { SocketContext } from '@/context/socket';
import { useCharacterGuard } from '@/hooks/useCharacterGuard';
import { useForestGuard } from '@/hooks/useForestGuard';
import { useGameGuard } from '@/hooks/useGameGuard';
import { useTowerGuard } from '@/hooks/useTowerGuard';
import { useCharacterStore } from '@/modules/character/store/character';

const ProtectedRouteGuards = () => {
  useCharacterGuard();
  useGameGuard();
  useTowerGuard();
  useForestGuard();

  return <Outlet />;
};

const socketContext = createContext<Socket<ServerToClientMessage, ClientToServerMessage>>();

const middleware: MiddlewareFunction = async ({ context }) => {
  try {
    const socket = await createWebSocket();

    context.set(socketContext, socket);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'No multiple connections') {
        return redirect('/connection-error');
      }
      if (e.message === 'Character not found' || e.message === 'Персонаж не найден') {
        return redirect('/create');
      }
    }

    return redirect('/error');
  }
};

const loader = async ({ context }: LoaderFunctionArgs) => {
  const socket = context.get(socketContext);
  const character = await getCharacter();

  return {
    socket,
    character,
  };
};

export const HydrateFallback = () => {
  return (
    <Card className="m-4" header="Загрузка">
      <Placeholder description="Ищем вашего персонажа..." />
    </Card>
  );
};

export const ProtectedRoute = () => {
  const { socket, character } = useLoaderData<typeof loader>();
  const setCharacter = useCharacterStore((state) => state.setCharacter);
  const characterID = useCharacterStore((state) => state.character?.id);

  if (!character) {
    return <Navigate to="/" />;
  }

  if (!characterID) {
    setCharacter(character);
  }

  return (
    <SocketContext.Provider value={socket}>
      <ProtectedRouteGuards />
    </SocketContext.Provider>
  );
};

ProtectedRoute.loader = loader;
ProtectedRoute.middleware = [middleware];
ProtectedRoute.HydrateFallback = HydrateFallback;
