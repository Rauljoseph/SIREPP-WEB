import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { EncargosPage } from './pages/EncargosPage';
import { HallazgosPage } from './pages/HallazgosPage';
import { ReunificacionesPage } from './pages/ReunificacionesPage';
import { ConsultaPage } from './pages/ConsultaPage';
import { LecturasPage } from './pages/LecturasPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
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
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
