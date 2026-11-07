import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Users, Plus, Trash2, Loader2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import {
  adminApi,
  type UnidadAdmin,
  type UsuarioAdmin,
  type CrearUnidadAdminDto,
  type CrearUsuarioAdminDto,
} from '../services/api';

// ── Constantes ────────────────────────────────────────
const TIPOS_UNIDAD = ['COMISARIA', 'SUBCOMISARIA', 'TENENCIA', 'RETEN'] as const;
const ROLES = ['GUARDIA', 'SUPERVISOR', 'CONSULTA', 'ADMINISTRADOR'] as const;

const tipoUnidadLabel: Record<string, string> = {
  COMISARIA: 'Comisaría',
  SUBCOMISARIA: 'Subcomisaría',
  TENENCIA: 'Tenencia',
  RETEN: 'Retén',
};

const rolLabel: Record<string, string> = {
  GUARDIA: 'Guardia',
  SUPERVISOR: 'Supervisor',
  CONSULTA: 'Consulta',
  ADMINISTRADOR: 'Administrador',
};

const rolBadge: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  ADMINISTRADOR: 'danger',
  SUPERVISOR: 'warning',
  CONSULTA: 'info',
  GUARDIA: 'success',
};

// ── Formularios iniciales ─────────────────────────────
const initialUnidadForm: CrearUnidadAdminDto = {
  nombre: '',
  tipo: 'COMISARIA',
  direccion: '',
  region: '',
  comuna: '',
  horarioAtencion: '',
  telefono: '',
};

const initialUsuarioForm: CrearUsuarioAdminDto = {
  nombreCompleto: '',
  email: '',
  rol: 'GUARDIA',
  unidadId: '',
};

type Tab = 'unidades' | 'usuarios';

export function AdminPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('unidades');

  // ── Modals ─────────────────────────────────────────
  const [showUnidadModal, setShowUnidadModal] = useState(false);
  const [unidadForm, setUnidadForm] = useState(initialUnidadForm);
  const [showUsuarioModal, setShowUsuarioModal] = useState(false);
  const [usuarioForm, setUsuarioForm] = useState(initialUsuarioForm);
  const [error, setError] = useState('');

  // ── Queries — sin destructuring de default ─────────
  const unidadesQuery = useQuery<UnidadAdmin[]>({
    queryKey: ['admin-unidades'],
    queryFn: () => adminApi.listarUnidades(),
  });

  const usuariosQuery = useQuery<UsuarioAdmin[]>({
    queryKey: ['admin-usuarios'],
    queryFn: () => adminApi.listarUsuarios(),
  });

  // Datos y contadores directamente del query
  const unidades = unidadesQuery.data ?? [];
  const usuarios = usuariosQuery.data ?? [];

  // ── Mutations ──────────────────────────────────────
  const crearUnidadMut = useMutation({
    mutationFn: (dto: CrearUnidadAdminDto) => adminApi.crearUnidad(dto),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-unidades'] });
      setShowUnidadModal(false);
      setUnidadForm(initialUnidadForm);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al crear unidad');
    },
  });

  const crearUsuarioMut = useMutation({
    mutationFn: (dto: CrearUsuarioAdminDto) => adminApi.crearUsuario(dto),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      setShowUsuarioModal(false);
      setUsuarioForm(initialUsuarioForm);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al crear usuario');
    },
  });

  const eliminarUnidadMut = useMutation({
    mutationFn: (id: string) => adminApi.eliminarUnidad(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-unidades'] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al eliminar unidad');
    },
  });

  const eliminarUsuarioMut = useMutation({
    mutationFn: (id: string) => adminApi.eliminarUsuario(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al eliminar usuario');
    },
  });

  // ── Handlers ───────────────────────────────────────
  function handleEliminarUnidad(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta unidad?')) return;
    eliminarUnidadMut.mutate(id);
  }

  function handleEliminarUsuario(id: string) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    eliminarUsuarioMut.mutate(id);
  }

  // ── Columnas tablas ─────────────────────────────────
  const unidadColumns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (u: UnidadAdmin) => (
        <span className="font-medium text-gray-900">{u.nombre}</span>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (u: UnidadAdmin) => (
        <Badge variant="info">{tipoUnidadLabel[u.tipo] || u.tipo}</Badge>
      ),
    },
    { key: 'comuna', header: 'Comuna' },
    { key: 'region', header: 'Región' },
    {
      key: 'usuarios',
      header: 'Usuarios',
      render: (u: UnidadAdmin) => (
        <span className="text-sm text-gray-600">{u._count?.usuarios ?? 0}</span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      render: (u: UnidadAdmin) => (
        <button
          onClick={() => handleEliminarUnidad(u.id)}
          className="text-red-400 hover:text-red-600 transition-colors p-1"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  const usuarioColumns = [
    {
      key: 'nombreCompleto',
      header: 'Nombre',
      render: (u: UsuarioAdmin) => (
        <span className="font-medium text-gray-900">{u.nombreCompleto}</span>
      ),
    },
    { key: 'email', header: 'Correo Electrónico' },
    {
      key: 'rol',
      header: 'Rol',
      render: (u: UsuarioAdmin) => (
        <Badge variant={rolBadge[u.rol] || 'neutral'}>
          {rolLabel[u.rol] || u.rol}
        </Badge>
      ),
    },
    {
      key: 'unidad',
      header: 'Unidad',
      render: (u: UsuarioAdmin) => (
        <span className="text-sm text-gray-600">{u.unidad?.nombre || '—'}</span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      render: (u: UsuarioAdmin) => (
        <button
          onClick={() => handleEliminarUsuario(u.id)}
          className="text-red-400 hover:text-red-600 transition-colors p-1"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────
  return (
    <div>
      <Header
        title="Administración"
        description="Gestión de unidades de Carabineros y usuarios del sistema"
        action={
          <Button onClick={() => tab === 'unidades' ? setShowUnidadModal(true) : setShowUsuarioModal(true)}>
            <Plus size={16} className="mr-1.5" />
            {tab === 'unidades' ? 'Nueva Unidad' : 'Crear Usuario'}
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-4">✕</button>
          </div>
        )}

        {/* Tabs — key fuerza rebuild del DOM cuando cambia la data */}
        <div
          key={`tabs-${unidadesQuery.dataUpdatedAt}-${usuariosQuery.dataUpdatedAt}`}
          className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit"
        >
          <button
            onClick={() => setTab('unidades')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'unidades'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 size={16} />
            <span>Unidades</span>
            <span>({unidades.length})</span>
          </button>
          <button
            onClick={() => setTab('usuarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'usuarios'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={16} />
            <span>Usuarios</span>
            <span>({usuarios.length})</span>
          </button>
        </div>

        {/* Contenido */}
        {tab === 'unidades' ? (
          <Card padding={false}>
            {unidadesQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-blue-700" />
                <span className="ml-3 text-gray-500">Cargando unidades...</span>
              </div>
            ) : unidades.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Sin unidades registradas"
                description="Crea la primera unidad de Carabineros para poder asignar usuarios al sistema."
                actionLabel="Nueva Unidad"
                onAction={() => setShowUnidadModal(true)}
              />
            ) : (
              <Table columns={unidadColumns} data={unidades} keyExtractor={(u) => u.id} />
            )}
          </Card>
        ) : (
          <Card padding={false}>
            {usuariosQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-blue-700" />
                <span className="ml-3 text-gray-500">Cargando usuarios...</span>
              </div>
            ) : usuarios.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Sin usuarios registrados"
                description="Crea el primer usuario del sistema. Necesitas al menos una unidad creada primero."
                actionLabel="Nuevo Usuario"
                onAction={() => setShowUsuarioModal(true)}
              />
            ) : (
              <Table columns={usuarioColumns} data={usuarios} keyExtractor={(u) => u.id} />
            )}
          </Card>
        )}
      </div>

      {/* ── Modal Crear Unidad ──────────────────────────── */}
      <Modal isOpen={showUnidadModal} onClose={() => setShowUnidadModal(false)} title="Nueva Unidad" size="md">
        <div className="space-y-4">
          <Input
            label="Nombre *"
            placeholder="1a Comisaría de Santiago Centro"
            value={unidadForm.nombre}
            onChange={(e) => setUnidadForm((p) => ({ ...p, nombre: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Unidad *</label>
            <select
              value={unidadForm.tipo}
              onChange={(e) => setUnidadForm((p) => ({ ...p, tipo: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIPOS_UNIDAD.map((t) => (
                <option key={t} value={t}>{tipoUnidadLabel[t]}</option>
              ))}
            </select>
          </div>
          <Input
            label="Dirección *"
            placeholder="Av. General Mackenna 1314, Santiago"
            value={unidadForm.direccion}
            onChange={(e) => setUnidadForm((p) => ({ ...p, direccion: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Región *"
              placeholder="Metropolitana"
              value={unidadForm.region}
              onChange={(e) => setUnidadForm((p) => ({ ...p, region: e.target.value }))}
            />
            <Input
              label="Comuna *"
              placeholder="Santiago"
              value={unidadForm.comuna}
              onChange={(e) => setUnidadForm((p) => ({ ...p, comuna: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Horario de Atención"
              placeholder="Lun-Vie 08:00-20:00"
              value={unidadForm.horarioAtencion || ''}
              onChange={(e) => setUnidadForm((p) => ({ ...p, horarioAtencion: e.target.value }))}
            />
            <Input
              label="Teléfono"
              placeholder="+56229221234"
              value={unidadForm.telefono || ''}
              onChange={(e) => setUnidadForm((p) => ({ ...p, telefono: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowUnidadModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => crearUnidadMut.mutate(unidadForm)}
              loading={crearUnidadMut.isPending}
              disabled={!unidadForm.nombre.trim() || !unidadForm.direccion.trim() || !unidadForm.region.trim() || !unidadForm.comuna.trim()}
            >
              Crear Unidad
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Crear Usuario ─────────────────────────── */}
      <Modal isOpen={showUsuarioModal} onClose={() => setShowUsuarioModal(false)} title="Nuevo Usuario" size="sm">
        <div className="space-y-4">
          <Input
            label="Nombre Completo *"
            placeholder="Juan Pérez González"
            value={usuarioForm.nombreCompleto}
            onChange={(e) => setUsuarioForm((p) => ({ ...p, nombreCompleto: e.target.value }))}
          />
          <Input
            label="Email *"
            placeholder="juan.perez@carabineros.cl"
            value={usuarioForm.email}
            onChange={(e) => setUsuarioForm((p) => ({ ...p, email: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
            <select
              value={usuarioForm.rol}
              onChange={(e) => setUsuarioForm((p) => ({ ...p, rol: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{rolLabel[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
            {unidades.length === 0 ? (
              <p className="text-sm text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2">
                Debes crear al menos una unidad primero.
              </p>
            ) : (
              <select
                value={usuarioForm.unidadId}
                onChange={(e) => setUsuarioForm((p) => ({ ...p, unidadId: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una unidad</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({tipoUnidadLabel[u.tipo]})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowUsuarioModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => crearUsuarioMut.mutate(usuarioForm)}
              loading={crearUsuarioMut.isPending}
              disabled={!usuarioForm.nombreCompleto.trim() || !usuarioForm.email.trim() || !usuarioForm.unidadId}
            >
              Crear Usuario
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}