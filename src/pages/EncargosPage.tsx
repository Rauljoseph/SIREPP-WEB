import { useState, Component, type ReactNode, type ErrorInfo } from 'react';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { EstadoEncargo, TipoEvento, type Encargo, type CrearEncargoDto } from '../types';
import { encargosApi, consultaApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Error boundary para capturar errores de renderizado
class EncargosErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[EncargosPage] Error de renderizado:', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32 }}>
          <h2 style={{ color: '#dc2626', marginBottom: 8 }}>Error en la pagina de Encargos</h2>
          <pre style={{ background: '#fef2f2', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: 12, padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const estadoBadge: Record<string, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
  VIGENTE: { variant: 'warning', label: 'Vigente' },
  REUNIFICADO: { variant: 'success', label: 'Reunificado' },
  ANULADO: { variant: 'neutral', label: 'Anulado' },
  CERRADO: { variant: 'danger', label: 'Cerrado' },
};

const tipoEventoLabels: Record<string, string> = {
  ROBO: 'Robo',
  HURTO: 'Hurto',
  EXTRAVIO: 'Extravío',
};

// Validar formato de placa patente chilena: LLNNNN (antigua) o LLLLNN (nueva)
function esPlacaValida(placa: string): boolean {
  const limpia = placa.toUpperCase().replace(/[-.\s]/g, '');
  return /^[A-Z]{2}\d{4}$/.test(limpia) || /^[A-Z]{4}\d{2}$/.test(limpia);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

const initialForm: CrearEncargoDto = {
  placa: '',
  tipoEvento: TipoEvento.ROBO,
  denuncianteRut: '',
  denuncianteNombre: '',
  denuncianteEmail: '',
  fechaHecho: new Date().toISOString().split('T')[0],
  unidadId: '',
  canalNotificacion: 'EMAIL',
  constanciaNumero: '',
  observaciones: '',
};

function EncargosPageContent() {
  const { puedeRegistrar, puedeAnular, usuario } = useAuth();
  const [encargos, setEncargos] = useState<Encargo[]>([]);
  const [searchPlaca, setSearchPlaca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [selectedEncargo, setSelectedEncargo] = useState<Encargo | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [form, setForm] = useState<CrearEncargoDto>(initialForm);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchPlaca.trim()) return;
    const placaLimpia = searchPlaca.toUpperCase().replace(/[-.\s]/g, '');
    if (!esPlacaValida(placaLimpia)) {
      setError('Formato de placa inválido. Use formato BBCC12 (nuevo) o BB1234 (antiguo)');
      return;
    }
    setSearchLoading(true);
    setError('');
    try {
      const estado = await consultaApi.estadoPlaca(placaLimpia);
      setEncargos(estado.encargo ? [estado.encargo] : []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al buscar encargos');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCrear = async () => {
    const placaLimpia = form.placa.toUpperCase().replace(/[-.\s]/g, '');
    if (!esPlacaValida(placaLimpia)) {
      setError('Formato de placa inválido. Use formato BBCC12 (nuevo) o BB1234 (antiguo)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const nuevoEncargo = await encargosApi.crear({
        placa: form.placa.toUpperCase().replace(/[-.\s]/g, ''),
        tipoEvento: form.tipoEvento,
        denuncianteRut: form.denuncianteRut,
        denuncianteNombre: form.denuncianteNombre,
        denuncianteEmail: form.denuncianteEmail,
        fechaHecho: form.fechaHecho,
        unidadId: usuario.unidadId,
        canalNotificacion: form.canalNotificacion || 'EMAIL',
        constanciaNumero: form.constanciaNumero || undefined,
        observaciones: form.observaciones || undefined,
      } as CrearEncargoDto);
      setEncargos((prev) => [nuevoEncargo, ...prev]);
      setShowModal(false);
      setForm(initialForm);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al crear encargo');
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = async () => {
    if (!selectedEncargo || !motivoAnulacion.trim()) return;
    setLoading(true);
    try {
      const updated = await encargosApi.anular(selectedEncargo.id, motivoAnulacion, usuario.id);
      setEncargos((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setShowAnularModal(false);
      setMotivoAnulacion('');
      setSelectedEncargo(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al anular encargo');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof CrearEncargoDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const columns = [
    {
      key: 'placa',
      header: 'Placa',
      render: (enc: Encargo) => (
        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
          {enc.placa}
        </span>
      ),
    },
    {
      key: 'tipoEvento',
      header: 'Tipo',
      render: (enc: Encargo) => tipoEventoLabels[enc.tipoEvento] || enc.tipoEvento,
    },
    {
      key: 'denuncianteNombre',
      header: 'Denunciante',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (enc: Encargo) => {
        const badge = estadoBadge[enc.estado] || { variant: 'neutral' as const, label: enc.estado };
        return <Badge variant={badge.variant}>{badge.label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      header: 'Fecha Registro',
      render: (enc: Encargo) => formatDate(enc.createdAt),
    },
    {
      key: 'acciones',
      header: '',
      render: (enc: Encargo) =>
        enc.estado === EstadoEncargo.VIGENTE && puedeAnular() ? (
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEncargo(enc);
              setShowAnularModal(true);
            }}
          >
            Anular
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <Header
        title="Encargos"
        description="Registro y gestión de encargos por sustracción de placas"
        action={
          puedeRegistrar() ? (
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-1.5" /> Nuevo Encargo
            </Button>
          ) : undefined
        }
      />

      <div className="p-8 space-y-6">
        {/* Search bar */}
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

        {/* Table */}
        <Card padding={false}>
          {encargos.length === 0 && !searchLoading ? (
            <EmptyState
              icon={AlertTriangle}
              title="Sin encargos"
              description="Busque una placa o registre un nuevo encargo para comenzar."
              actionLabel={puedeRegistrar() ? "Nuevo Encargo" : undefined}
              onAction={puedeRegistrar() ? () => setShowModal(true) : undefined}
            />
          ) : (
            <Table
              columns={columns}
              data={encargos}
              keyExtractor={(e) => e.id}
            />
          )}
        </Card>
      </div>

      {/* Modal Crear */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Registrar Nuevo Encargo" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Placa *"
              placeholder="BBCC12"
              value={form.placa}
              onChange={(e) => updateForm('placa', e.target.value)}
              helperText="Formato: ABCD12 o AB1234"
            />
            <Select
              label="Tipo de Evento *"
              value={form.tipoEvento}
              onChange={(e) => updateForm('tipoEvento', e.target.value)}
              options={[
                { value: 'ROBO', label: 'Robo' },
                { value: 'HURTO', label: 'Hurto' },
                { value: 'EXTRAVIO', label: 'Extravío' },
              ]}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Datos del Denunciante</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="RUT *"
                placeholder="12.345.678-9"
                value={form.denuncianteRut}
                onChange={(e) => updateForm('denuncianteRut', e.target.value)}
              />
              <Input
                label="Nombre *"
                placeholder="Nombre completo"
                value={form.denuncianteNombre}
                onChange={(e) => updateForm('denuncianteNombre', e.target.value)}
              />
              <Input
                label="Email *"
                type="email"
                placeholder="correo@ejemplo.cl"
                value={form.denuncianteEmail}
                onChange={(e) => updateForm('denuncianteEmail', e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Detalles del Encargo</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha del Hecho *"
                type="date"
                value={form.fechaHecho}
                onChange={(e) => updateForm('fechaHecho', e.target.value)}
              />
              <Input
                label="N° Constancia"
                placeholder="C-2026-001234"
                value={form.constanciaNumero || ''}
                onChange={(e) => updateForm('constanciaNumero', e.target.value)}
                helperText="Número de constancia policial (opcional)"
              />
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Canal de notificación: Correo Electrónico
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Detalles adicionales sobre el encargo (opcional)"
                value={form.observaciones || ''}
                onChange={(e) => updateForm('observaciones', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrear} loading={loading}>
              Registrar Encargo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Anular */}
      <Modal
        isOpen={showAnularModal}
        onClose={() => {
          setShowAnularModal(false);
          setSelectedEncargo(null);
        }}
        title="Anular Encargo"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Está seguro de anular el encargo de la placa{' '}
            <span className="font-mono font-bold">{selectedEncargo?.placa}</span>?
            Esta acción no se puede deshacer.
          </p>
          <Input
            label="Motivo de anulación *"
            placeholder="Indique el motivo"
            value={motivoAnulacion}
            onChange={(e) => setMotivoAnulacion(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAnularModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleAnular} loading={loading} disabled={!motivoAnulacion.trim()}>
              Confirmar Anulación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function EncargosPage() {
  return (
    <EncargosErrorBoundary>
      <EncargosPageContent />
    </EncargosErrorBoundary>
  );
}