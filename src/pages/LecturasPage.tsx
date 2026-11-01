import { useState } from 'react';
import { Radio, Plus } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import type { EventoLectura, LecturaPorticoDto } from '../types';
import { lecturaApi } from '../services/api';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const initialForm: LecturaPorticoDto = {
  placa: '',
  portico: '',
  nivelConfianza: 0.85,
  timestampLectura: new Date().toISOString(),
};

export function LecturasPage() {
  const [lecturas, setLecturas] = useState<EventoLectura[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<LecturaPorticoDto>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegistrar = async () => {
    setLoading(true);
    setError('');
    try {
      const nueva = await lecturaApi.registrar({
        ...form,
        placa: form.placa.toUpperCase().replace(/[-.\s]/g, ''),
        timestampLectura: new Date().toISOString(),
      });
      setLecturas((prev) => [nueva, ...prev]);
      setShowModal(false);
      setForm(initialForm);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al registrar lectura');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'placa',
      header: 'Placa',
      render: (l: EventoLectura) => (
        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
          {l.placa}
        </span>
      ),
    },
    {
      key: 'portico',
      header: 'Pórtico',
    },
    {
      key: 'nivelConfianza',
      header: 'Confianza',
      render: (l: EventoLectura) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          l.nivelConfianza >= 0.75
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {(l.nivelConfianza * 100).toFixed(0)}%
        </span>
      ),
    },
    {
      key: 'notificado',
      header: 'Notificado',
      render: (l: EventoLectura) => (
        <Badge variant={l.notificado ? 'success' : 'neutral'}>
          {l.notificado ? 'Sí' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'timestampLectura',
      header: 'Timestamp',
      render: (l: EventoLectura) => formatDate(l.timestampLectura),
    },
  ];

  return (
    <div>
      <Header
        title="Lecturas de Pórtico"
        description="Simulación de detecciones automáticas de placas en pórticos"
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-1.5" /> Simular Lectura
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card padding={false}>
          {lecturas.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="Sin lecturas"
              description="Simule una lectura de pórtico para ver cómo el sistema detecta y notifica coincidencias con encargos vigentes."
              actionLabel="Simular Lectura"
              onAction={() => setShowModal(true)}
            />
          ) : (
            <Table columns={columns} data={lecturas} keyExtractor={(l) => l.id} />
          )}
        </Card>

        {/* Info card */}
        <Card>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Radio size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Funcionamiento del módulo de trazabilidad</p>
              <p className="text-sm text-gray-500 mt-1">
                Cuando un pórtico detecta una placa con encargo vigente y el nivel de confianza
                supera el umbral (75%), el sistema genera automáticamente una notificación al
                denunciante registrado en el encargo.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal Simular */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Simular Lectura de Pórtico" size="sm">
        <div className="space-y-4">
          <Input
            label="Placa *"
            placeholder="BBCC12"
            value={form.placa}
            onChange={(e) => setForm((p) => ({ ...p, placa: e.target.value }))}
          />
          <Input
            label="Pórtico *"
            placeholder="Ej: Autopista Central KM 15"
            value={form.portico}
            onChange={(e) => setForm((p) => ({ ...p, portico: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de Confianza: {(form.nivelConfianza * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={form.nivelConfianza}
              onChange={(e) => setForm((p) => ({ ...p, nivelConfianza: parseFloat(e.target.value) }))}
              className="w-full accent-blue-700"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span className="text-yellow-600 font-medium">Umbral 75%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRegistrar}
              loading={loading}
              disabled={!form.placa.trim() || !form.portico.trim()}
            >
              Registrar Lectura
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
