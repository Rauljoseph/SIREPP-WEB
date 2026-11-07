import { useState } from 'react';
import { Radio, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
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

const PORTICOS_SIMULADOS = [
  'Autopista Central - KM 15 Norte',
  'Autopista Central - KM 32 Sur',
  'Costanera Norte - Peaje Lo Echevers',
  'Vespucio Norte Express - KM 8',
  'Ruta 5 Sur - Peaje Angostura',
  'Autopista Los Libertadores - KM 12',
];

const initialForm: LecturaPorticoDto = {
  placa: '',
  portico: PORTICOS_SIMULADOS[0],
  nivelConfianza: 0.85,
  timestampLectura: new Date().toISOString(),
};

interface ResultadoLectura {
  tipo: 'exito' | 'sin_encargo' | 'bajo_umbral';
  mensaje: string;
}

export function LecturasPage() {
  const [lecturas, setLecturas] = useState<EventoLectura[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<LecturaPorticoDto>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<ResultadoLectura | null>(null);

  const handleRegistrar = async () => {
    setLoading(true);
    setError('');
    setResultado(null);
    try {
      const respuesta = await lecturaApi.registrar({
        ...form,
        placa: form.placa.toUpperCase().replace(/[-.\s]/g, ''),
        timestampLectura: new Date().toISOString(),
      });

      if (!respuesta.registrada) {
        // No hay encargo vigente para esa placa
        setResultado({
          tipo: 'sin_encargo',
          mensaje: `La placa ${form.placa.toUpperCase()} no tiene encargo vigente. No se registró lectura.`,
        });
      } else if (respuesta.notificada) {
        // Lectura registrada + correo enviado
        setLecturas((prev) => [respuesta, ...prev]);
        setResultado({
          tipo: 'exito',
          mensaje: `Placa detectada con encargo vigente. Se notificó al denunciante por correo.`,
        });
      } else {
        // Lectura registrada pero sin notificación (bajo umbral o error de correo)
        setLecturas((prev) => [respuesta, ...prev]);
        setResultado({
          tipo: 'bajo_umbral',
          mensaje: respuesta.motivo || 'Lectura registrada sin notificación.',
        });
      }

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
        description="Simulación de detecciones automáticas de placas en pórticos de autopistas"
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

        {/* Feedback del resultado */}
        {resultado && (
          <div className={`border rounded-lg px-4 py-3 text-sm flex items-start gap-2 ${
            resultado.tipo === 'exito'
              ? 'bg-green-50 border-green-200 text-green-700'
              : resultado.tipo === 'sin_encargo'
                ? 'bg-gray-50 border-gray-200 text-gray-600'
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}>
            {resultado.tipo === 'exito' ? (
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            )}
            {resultado.mensaje}
          </div>
        )}

        <Card padding={false}>
          {lecturas.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="Sin lecturas"
              description="Simule una lectura de pórtico para ver cómo el sistema detecta placas con encargo vigente y notifica automáticamente al denunciante."
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
              <p className="text-sm font-medium text-gray-700">¿Cómo funciona el módulo de trazabilidad?</p>
              <p className="text-sm text-gray-500 mt-1">
                Los pórticos TAG de las autopistas envían un evento cada vez que leen una placa.
                SIREPP está escuchando (observer) y cuando detecta que la placa tiene un encargo
                vigente con confianza superior al 75%, envía automáticamente un correo al denunciante
                informándole del avistamiento. Si el correo falla, reintenta 3 veces antes de
                marcarlo para reintento manual.
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
            helperText="Ingrese la placa que el pórtico habría detectado"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pórtico *</label>
            <select
              value={form.portico}
              onChange={(e) => setForm((p) => ({ ...p, portico: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PORTICOS_SIMULADOS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
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
              disabled={!form.placa.trim()}
            >
              Enviar Lectura
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}