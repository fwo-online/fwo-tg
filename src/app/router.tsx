import { createHashRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { withBackButton } from './hocs/withBackButton';
import { CharacterAttributesPage } from './pages/CharacterAttributesPage/CharacterAttributesPage';
import { CharacterPage } from './pages/CharacterPage/CharacterPage';
import { CreateCharacterPage } from './pages/CreateCharacterPage/CreateCharacterPage';

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
    ],
  },
  {
    path: '*',
    element: <Navigate to='/' />,
  },
]);
