import { createHashRouter, Navigate } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { withBackButton } from './hocs/withBackButton';
import { CharacterAttributesPage } from './pages/CharacterAttributesPage/CharacterAttributesPage';
import { CharacterPage } from './pages/CharacterPage/CharacterPage';
import { CreateCharacterPage } from './pages/CreateCharacterPage/CreateCharacterPage';
import { CharacterMagics } from './pages/CharacterMagics/CharacterMagics';

export const router = createHashRouter([
  {
    index: true,
    Component: CreateCharacterPage,
  },
  {
    path: '/character',
    Component: ProtectedRoute,
    children: [
      {
        path: '',
        Component: CharacterPage,
      },
      {
        path: 'attributes',
        Component: withBackButton(CharacterAttributesPage),
      },
      {
        path: 'magics',
        Component: withBackButton(CharacterMagics),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
]);
