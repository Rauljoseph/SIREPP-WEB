import { useState } from 'react';
import { Handshake, Search } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { type Reunificacion, type CerrarCasoDto, EstadoReunificacion } from '../types';
import { reunificacionesApi, consultaApi } from '../services/api';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function ReunificacionesPage() {
  const [reunificaciones, setReunificaciones] = useState<Reunificacion[]>([]);
  const [searchPlaca, setSearchPlaca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReunificacion, setSelectedReunificacion] = useState<Reunificacion | null>(null);
  const [form, setForm] = useState<CerrarCasoDto>({ receptorRut: '', receptorNombre: '' });
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchPlaca.trim()) return;
    setSearchLoading(true);
    setError('');
    try {
      const estado = await consultaApi.estadoPlaca(searchPlaca.toUpperCase().replace(/[-.\s]/g, ''));
      setReunificaciones(estado.reunificacion ? [estado.reunificacion] : []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al buscar');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCerrar = async () => {
    if (!selectedReunificacion) return;
    setLoading(true);
    setError('');
    try {
      await reunificacionesApi.cerrarCaso(selectedReunificacion.id, form);
      // Refrescar datos buscando la placa de nuevo
      if (searchPlaca.trim()) {
        const estado = await consultaApi.estadoPlaca(searchPlaca.toUpperCase().replace(/[-.\s]/g, ''));
        setReunificaciones(estado.reunificacion ? [estado.reunificacion] : []);
      }
      setShowModal(false);
      setForm({ receptorRut: '', receptorNombre: '' });
      setSelectedReunificacion(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al cerrar caso');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (r: Reunificacion) => (
        <span className="text-xs font-mono text-gray-500">{r.id.slice(0, 8)}…</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (r: Reunificacion) => (
        <Badge variant={r.estado === EstadoReunificacion.ENTREGADA ? 'success' : 'warning'}>
          {r.estado === EstadoReunificacion.ENTREGADA ? 'Entregada' : 'Pendiente de Retiro'}
        </Badge>
      ),
    },
    {
      key: 'receptor',
      header: 'Receptor',
      render: (r: Reunificacion) => r.receptorNombre ? (
        <div>
          <p className="text-sm text-gray-700">{r.receptorNombre}</p>
          <p className="text-xs text-gray-400">{r.receptorRut}</p>
        </div>
      ) : '—',
    },
    {
      key: 'fechaEntrega',
      header: 'Fecha Entrega',
      render: (r: Reunificacion) => r.fechaEntrega ? formatDate(r.fechaEntrega) : '—',
    },
    {
      key: 'fechaConciliacion',
      header: 'Fecha Reunificación',
      render: (r: Reunificacion) => r.fechaConciliacion ? formatDate(r.fechaConciliacion) : '—',
    },
    {
      key: 'acciones',
      header: '',
      render: (r: Reunificacion) =>
        r.estado === EstadoReunificacion.PENDIENTE_RETIRO ? (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReunificacion(r);
              setShowModal(true);
            }}
          >
            Entregar
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <Header
        title="Reunificaciones"
        description="Gestión de entregas de placas reunificadas a propietarios"
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
          {reunificaciones.length === 0 && !searchLoading ? (
            <EmptyState
              icon={Handshake}
              title="Sin reunificaciones"
              description="Busque una placa para ver sus reunificaciones."
            />
          ) : (
            <Table columns={columns} data={reunificaciones} keyExtractor={(r) => r.id} />
          )}
        </Card>
      </div>

      {/* Modal Entregar */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Cerrar Caso — Entrega al Propietario" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Registre los datos de la persona que recibe la placa.
          </p>
          <Input
            label="RUT del Receptor *"
            placeholder="12.345.678-9"
            value={form.receptorRut}
            onChange={(e) => setForm((p) => ({ ...p, receptorRut: e.target.value }))}
          />
          <Input
            label="Nombre del Receptor *"
            placeholder="Nombre completo"
            value={form.receptorNombre}
            onChange={(e) => setForm((p) => ({ ...p, receptorNombre: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCerrar}
              loading={loading}
              disabled={!form.receptorRut.trim() || !form.receptorNombre.trim()}
            >
              Confirmar Entrega
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
