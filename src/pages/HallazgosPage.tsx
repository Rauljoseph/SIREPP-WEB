import { useState } from 'react';
import { Plus, Search, FileSearch } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { EstadoFisico, type Hallazgo, type CrearHallazgoDto } from '../types';
import { hallazgosApi } from '../services/api';

const UNIDAD_DEMO_ID = '11111111-1111-1111-1111-111111111111';

const estadoFisicoLabels: Record<string, string> = {
  BUENO: 'Bueno',
  REGULAR: 'Regular',
  MALO: 'Malo',
  DESARMADO: 'Desarmado',
};

const estadoFisicoBadge: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  BUENO: 'success',
  REGULAR: 'warning',
  MALO: 'danger',
  DESARMADO: 'danger',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

const initialForm: CrearHallazgoDto = {
  placa: '',
  estadoFisico: EstadoFisico.BUENO,
  ubicacion: '',
  observaciones: '',
  unidadId: UNIDAD_DEMO_ID,
};

export function HallazgosPage() {
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
  const [searchPlaca, setSearchPlaca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CrearHallazgoDto>(initialForm);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchPlaca.trim()) return;
    setSearchLoading(true);
    setError('');
    try {
      const results = await hallazgosApi.buscarPorPlaca(searchPlaca.toUpperCase().replace(/[-.\s]/g, ''));
      setHallazgos(results);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al buscar hallazgos');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCrear = async () => {
    setLoading(true);
    setError('');
    try {
      const nuevo = await hallazgosApi.crear({
        ...form,
        placa: form.placa.toUpperCase().replace(/[-.\s]/g, ''),
      });
      setHallazgos((prev) => [nuevo, ...prev]);
      setShowModal(false);
      setForm(initialForm);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al registrar hallazgo');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'placa',
      header: 'Placa',
      render: (h: Hallazgo) => (
        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
          {h.placa}
        </span>
      ),
    },
    {
      key: 'estadoFisico',
      header: 'Estado Físico',
      render: (h: Hallazgo) => (
        <Badge variant={estadoFisicoBadge[h.estadoFisico] || 'neutral'}>
          {estadoFisicoLabels[h.estadoFisico] || h.estadoFisico}
        </Badge>
      ),
    },
    {
      key: 'ubicacion',
      header: 'Ubicación',
      render: (h: Hallazgo) => h.ubicacion || '—',
    },
    {
      key: 'observaciones',
      header: 'Observaciones',
      render: (h: Hallazgo) => (
        <span className="truncate max-w-xs block">{h.observaciones || '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha Registro',
      render: (h: Hallazgo) => formatDate(h.createdAt),
    },
  ];

  return (
    <div>
      <Header
        title="Hallazgos"
        description="Registro de placas encontradas en operativos y fiscalizaciones"
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-1.5" /> Nuevo Hallazgo
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        <Card>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Buscar por placa"
                placeholder="Ej: BBCC12"
                value={searchPlaca}
                onChange={(e) => setSearchPlaca(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} loading={searchLoading}>
              <Search size={16} className="mr-1.5" /> Buscar
            </Button>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card padding={false}>
          {hallazgos.length === 0 && !searchLoading ? (
            <EmptyState
              icon={FileSearch}
              title="Sin hallazgos"
              description="Busque una placa o registre un nuevo hallazgo."
              actionLabel="Nuevo Hallazgo"
              onAction={() => setShowModal(true)}
            />
          ) : (
            <Table columns={columns} data={hallazgos} keyExtractor={(h) => h.id} />
          )}
        </Card>
      </div>

      {/* Modal Crear */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Registrar Hallazgo" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Placa *"
              placeholder="BBCC12"
              value={form.placa}
              onChange={(e) => setForm((p) => ({ ...p, placa: e.target.value }))}
              helperText="Formato: ABCD12 o AB1234"
            />
            <Select
              label="Estado Físico *"
              value={form.estadoFisico}
              onChange={(e) => setForm((p) => ({ ...p, estadoFisico: e.target.value as EstadoFisico }))}
              options={[
                { value: 'BUENO', label: 'Bueno' },
                { value: 'REGULAR', label: 'Regular' },
                { value: 'MALO', label: 'Malo' },
                { value: 'DESARMADO', label: 'Desarmado' },
              ]}
            />
          </div>
          <Input
            label="Ubicación"
            placeholder="Dirección donde se encontró"
            value={form.ubicacion || ''}
            onChange={(e) => setForm((p) => ({ ...p, ubicacion: e.target.value }))}
          />
          <Input
            label="Observaciones"
            placeholder="Detalles del hallazgo"
            value={form.observaciones || ''}
            onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrear} loading={loading}>
              Registrar Hallazgo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
