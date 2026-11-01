import { useState } from 'react';
import { Search, AlertTriangle, FileSearch, Handshake, Radio, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import type { EstadoPlaca } from '../types';
import { consultaApi } from '../services/api';

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
  PENDIENTE: { variant: 'warning', label: 'Pendiente' },
  ENTREGADO: { variant: 'success', label: 'Entregado' },
};

export function ConsultaPage() {
  const [placa, setPlaca] = useState('');
  const [resultado, setResultado] = useState<EstadoPlaca | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!placa.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const data = await consultaApi.estadoPlaca(placa.toUpperCase().replace(/[-.\s]/g, ''));
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
                {resultado.resumen.tieneEncargoVigente ? (
                  <>
                    <div className="p-3 rounded-xl bg-red-100">
                      <ShieldAlert size={28} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-700">
                        Placa con encargo vigente
                      </h3>
                      <p className="text-sm text-red-600">
                        La placa <span className="font-mono font-bold">{resultado.placa}</span> tiene un encargo activo en el sistema.
                      </p>
                    </div>
                  </>
                ) : resultado.resumen.estaCerrada ? (
                  <>
                    <div className="p-3 rounded-xl bg-green-100">
                      <ShieldCheck size={28} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-700">Caso cerrado</h3>
                      <p className="text-sm text-green-600">
                        La placa <span className="font-mono font-bold">{resultado.placa}</span> fue entregada al propietario.
                      </p>
                    </div>
                  </>
                ) : resultado.resumen.estaReunificada ? (
                  <>
                    <div className="p-3 rounded-xl bg-blue-100">
                      <ShieldCheck size={28} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-700">Placa reunificada</h3>
                      <p className="text-sm text-blue-600">
                        La placa <span className="font-mono font-bold">{resultado.placa}</span> fue reunificada. Pendiente de entrega.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-gray-100">
                      <ShieldCheck size={28} className="text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-700">Sin encargo vigente</h3>
                      <p className="text-sm text-gray-500">
                        La placa <span className="font-mono font-bold">{resultado.placa}</span> no tiene encargos activos.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Encargos */}
              <Card padding={false}>
                <div className="p-5 pb-0">
                  <CardHeader
                    title={`Encargos (${resultado.encargos.length})`}
                    description="Historial de encargos registrados"
                  />
                </div>
                {resultado.encargos.length === 0 ? (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-400 py-4 text-center">Sin encargos registrados</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {resultado.encargos.map((enc) => {
                      const badge = estadoBadge[enc.estado] || { variant: 'neutral' as const, label: enc.estado };
                      return (
                        <div key={enc.id} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertTriangle size={16} className="text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-700">{enc.tipoEvento}</p>
                              <p className="text-xs text-gray-400">{formatDate(enc.createdAt)}</p>
                            </div>
                          </div>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                      );
                    })}
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
                            <p className="text-sm text-gray-700">{hal.ubicacion || 'Sin ubicación'}</p>
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

              {/* Reunificaciones */}
              <Card padding={false}>
                <div className="p-5 pb-0">
                  <CardHeader
                    title={`Reunificaciones (${resultado.reunificaciones.length})`}
                    description="Procesos de conciliación y entrega"
                  />
                </div>
                {resultado.reunificaciones.length === 0 ? (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-400 py-4 text-center">Sin reunificaciones</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {resultado.reunificaciones.map((reu) => {
                      const badge = estadoBadge[reu.estado] || { variant: 'neutral' as const, label: reu.estado };
                      return (
                        <div key={reu.id} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Handshake size={16} className="text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-700">
                                {reu.receptorNombre || 'Pendiente de entrega'}
                              </p>
                              <p className="text-xs text-gray-400">{formatDate(reu.createdAt)}</p>
                            </div>
                          </div>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Lecturas de pórtico */}
              <Card padding={false}>
                <div className="p-5 pb-0">
                  <CardHeader
                    title={`Lecturas (${resultado.lecturas.length})`}
                    description="Detecciones en pórticos de trazabilidad"
                  />
                </div>
                {resultado.lecturas.length === 0 ? (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-400 py-4 text-center">Sin lecturas registradas</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {resultado.lecturas.slice(0, 5).map((lec) => (
                      <div key={lec.id} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Radio size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-700">{lec.portico}</p>
                            <p className="text-xs text-gray-400">{formatDate(lec.timestampLectura)}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          lec.nivelConfianza >= 0.75
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {(lec.nivelConfianza * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
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
