import { useState } from 'react';
import { Search, AlertTriangle, FileSearch, Handshake, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import type { EstadoPlaca } from '../types';
import { consultaApi } from '../services/api';

// Validar formato de placa patente chilena: LLNNNN (antigua) o LLLLNN (nueva)
function esPlacaValida(placa: string): boolean {
  const limpia = placa.toUpperCase().replace(/[-.\s]/g, '');
  return /^[A-Z]{2}\d{4}$/.test(limpia) || /^[A-Z]{4}\d{2}$/.test(limpia);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const estadoBadge: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; label: string }> = {
  VIGENTE: { variant: 'warning', label: 'Vigente' },
  REUNIFICADO: { variant: 'success', label: 'Reunificado' },
  ANULADO: { variant: 'neutral', label: 'Anulado' },
  CERRADO: { variant: 'info', label: 'Cerrado' },
  PENDIENTE_RETIRO: { variant: 'warning', label: 'Pendiente' },
  ENTREGADA: { variant: 'success', label: 'Entregada' },
};

export function ConsultaPage() {
  const [placa, setPlaca] = useState('');
  const [resultado, setResultado] = useState<EstadoPlaca | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!placa.trim()) return;
    const placaLimpia = placa.toUpperCase().replace(/[-.\s]/g, '');
    if (!esPlacaValida(placaLimpia)) {
      setError('Formato de placa inválido. Use formato BBCC12 (nuevo) o BB1234 (antiguo)');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const data = await consultaApi.estadoPlaca(placaLimpia);
      setResultado(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al consultar placa');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="Consulta de Placa"
        description="Consulte el estado completo de una placa patente en el sistema"
      />

      <div className="p-8 space-y-6">
        {/* Search */}
        <Card>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Placa Patente"
                placeholder="Ingrese la placa — Ej: BBCC12"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} loading={loading} size="lg">
              <Search size={18} className="mr-2" /> Consultar
            </Button>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!resultado && searched && !loading && !error && (
          <Card>
            <EmptyState
              icon={Search}
              title="Sin resultados"
              description="No se encontraron registros para la placa ingresada."
            />
          </Card>
        )}

        {resultado && (
          <>
            {/* Status Banner */}
            <Card>
              <div className="flex items-center gap-4">
                {resultado.encargo?.estado === 'VIGENTE' ? (
                  <>
                    <div className="p-3 rounded-xl bg-red-100">
                      <ShieldAlert size={28} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-700">Placa con encargo vigente</h3>
                      <p className="text-sm text-red-600">{resultado.resumen}</p>
                    </div>
                  </>
                ) : resultado.reunificacion ? (
                  <>
                    <div className="p-3 rounded-xl bg-blue-100">
                      <ShieldCheck size={28} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-700">
                        {resultado.reunificacion.estado === 'ENTREGADA' ? 'Caso cerrado' : 'Placa reunificada'}
                      </h3>
                      <p className="text-sm text-blue-600">{resultado.resumen}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-gray-100">
                      <ShieldCheck size={28} className="text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-700">Sin encargo vigente</h3>
                      <p className="text-sm text-gray-500">{resultado.resumen}</p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Encargo */}
              <Card padding={false}>
                <div className="p-5 pb-0">
                  <CardHeader
                    title="Encargo"
                    description="Encargo registrado para esta placa"
                  />
                </div>
                {!resultado.encargo ? (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-400 py-4 text-center">Sin encargo registrado</p>
                  </div>
                ) : (
                  <div className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-700">{resultado.encargo.tipoEvento}</p>
                        <p className="text-xs text-gray-400">{formatDate(resultado.encargo.createdAt)}</p>
                      </div>
                    </div>
                    <Badge variant={(estadoBadge[resultado.encargo.estado] || { variant: 'neutral' as const }).variant}>
                      {(estadoBadge[resultado.encargo.estado] || { label: resultado.encargo.estado }).label}
                    </Badge>
                  </div>
                )}
              </Card>

              {/* Hallazgos */}
              <Card padding={false}>
                <div className="p-5 pb-0">
                  <CardHeader
                    title={`Hallazgos (${resultado.hallazgos.length})`}
                    description="Registros de hallazgos de la placa"
                  />
                </div>
                {resultado.hallazgos.length === 0 ? (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-400 py-4 text-center">Sin hallazgos registrados</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {resultado.hallazgos.map((hal) => (
                      <div key={hal.id} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileSearch size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-700">{hal.estadoFisico}</p>
                            <p className="text-xs text-gray-400">{formatDate(hal.createdAt)}</p>
                          </div>
                        </div>
                        <Badge variant={
                          hal.estadoFisico === 'BUENO' ? 'success' :
                            hal.estadoFisico === 'REGULAR' ? 'warning' : 'danger'
                        }>
                          {hal.estadoFisico}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Reunificación */}
              <Card padding={false}>
                <div className="p-5 pb-0">
                  <CardHeader
                    title="Reunificación"
                    description="Proceso de conciliación y entrega"
                  />
                </div>
                {!resultado.reunificacion ? (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-400 py-4 text-center">Sin reunificación</p>
                  </div>
                ) : (
                  <div className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Handshake size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-700">
                          Conciliada el {formatDate(resultado.reunificacion.fechaConciliacion)}
                        </p>
                        {resultado.reunificacion.fechaEntrega && (
                          <p className="text-xs text-gray-400">
                            Entregada: {formatDate(resultado.reunificacion.fechaEntrega)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={(estadoBadge[resultado.reunificacion.estado] || { variant: 'neutral' as const }).variant}>
                      {(estadoBadge[resultado.reunificacion.estado] || { label: resultado.reunificacion.estado }).label}
                    </Badge>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}