import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { CharacterContext } from '../contexts/character';

export const ProtectedRoute = () => {
  const { character } = useContext(CharacterContext);

  if (!character) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
};
