import { createContext, useContext, useState, type ReactNode } from 'react';
import { Rol } from '../types';

export interface UsuarioMock {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  unidadId: string;
  iniciales: string;
}

const USUARIOS_MOCK: Record<Rol, UsuarioMock> = {
  [Rol.ADMIN]: {
    id: 'a0000000-0000-0000-0000-000000000001',
    nombre: 'Admin Sistema',
    email: 'admin@sirepp.cl',
    rol: Rol.ADMIN,
    unidadId: '11111111-1111-1111-1111-111111111111',
    iniciales: 'AS',
  },
  [Rol.SUPERVISOR]: {
    id: 's0000000-0000-0000-0000-000000000002',
    nombre: 'Carlos Muñoz',
    email: 'carlos.munoz@sirepp.cl',
    rol: Rol.SUPERVISOR,
    unidadId: '11111111-1111-1111-1111-111111111111',
    iniciales: 'CM',
  },
  [Rol.FUNCIONARIO]: {
    id: 'f0000000-0000-0000-0000-000000000003',
    nombre: 'María López',
    email: 'maria.lopez@sirepp.cl',
    rol: Rol.FUNCIONARIO,
    unidadId: '11111111-1111-1111-1111-111111111111',
    iniciales: 'ML',
  },
  [Rol.GUARDIA]: {
    id: 'g0000000-0000-0000-0000-000000000004',
    nombre: 'Pedro Soto',
    email: 'pedro.soto@sirepp.cl',
    rol: Rol.GUARDIA,
    unidadId: '11111111-1111-1111-1111-111111111111',
    iniciales: 'PS',
  },
};

interface AuthContextType {
  usuario: UsuarioMock;
  cambiarRol: (rol: Rol) => void;
  puedeRegistrar: () => boolean;
  puedeAnular: () => boolean;
  puedeConsultar: () => boolean;
  puedeAdministrar: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [rol, setRol] = useState<Rol>(Rol.GUARDIA);
  const usuario = USUARIOS_MOCK[rol];

  const puedeRegistrar = () => usuario.rol === Rol.GUARDIA;
  const puedeAnular = () => usuario.rol === Rol.SUPERVISOR;
  const puedeConsultar = () => true;
  const puedeAdministrar = () => usuario.rol === Rol.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cambiarRol: setRol,
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
