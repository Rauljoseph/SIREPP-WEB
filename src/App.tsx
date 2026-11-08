import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth, type UsuarioSesion } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { EncargosPage } from './pages/EncargosPage';
import { HallazgosPageWithBoundary as HallazgosPage } from './pages/HallazgosPage';
import { ReunificacionesPage } from './pages/ReunificacionesPage';
import { ConsultaPage } from './pages/ConsultaPage';
import { LecturasPage } from './pages/LecturasPage';
import { AdminPage } from './pages/AdminPage';
import { Rol } from './types';
import AuditoriaPage from "./pages/auditoriaPage.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AdminRoute() {
  const { usuario } = useAuth();
  if (usuario.rol !== Rol.ADMIN) {
    return <Navigate to="/" replace />;
  }
  return <AdminPage />;
}

function AuditoriaRoute() {
  const { usuario } = useAuth();
  if (usuario.rol !== Rol.ADMIN) {
    return <Navigate to="/" replace />;
  }
  return <AuditoriaPage />;
}

function App({ usuario }: { usuario: UsuarioSesion }) {
  return (
    <AuthProvider usuario={usuario}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/encargos" element={<EncargosPage />} />
              <Route path="/hallazgos" element={<HallazgosPage />} />
              <Route path="/reunificaciones" element={<ReunificacionesPage />} />
              <Route path="/consulta" element={<ConsultaPage />} />
              <Route path="/lecturas" element={<LecturasPage />} />
              <Route path="/admin" element={<AdminRoute />} />
              <Route path="/auditoria" element={<AuditoriaRoute />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;