import { createContext, useContext, type ReactNode } from 'react';
import { Rol } from '../types';

export interface UsuarioSesion {
  id: string;
  rol: Rol;
  unidadId: string;
}

interface AuthContextType {
  usuario: UsuarioSesion;
  puedeRegistrar: () => boolean;
  puedeAnular: () => boolean;
  puedeConsultar: () => boolean;
  puedeAdministrar: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children, usuario }: { children: ReactNode; usuario: UsuarioSesion }) {
  const puedeRegistrar = () => usuario.rol === Rol.GUARDIA;
  const puedeAnular = () => usuario.rol === Rol.SUPERVISOR;
  const puedeConsultar = () => true;
  const puedeAdministrar = () => usuario.rol === Rol.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        puedeRegistrar,
        puedeAnular,
        puedeConsultar,
        puedeAdministrar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}