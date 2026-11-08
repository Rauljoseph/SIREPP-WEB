import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app.css'
import App from './App.tsx'
import { isAxiosError } from 'axios'
import { endSession, startSession } from './auth/keycloak'
import api from './services/api'
import { PantallaAcceso } from './auth/PantallaAcceso'

// Fix React 19 + browser extensions (Migaku, translators, etc.)
// Extensions modify the DOM and React 19 crashes on insertBefore/removeChild.
// This patches those methods to silently handle the mismatch.
const originalInsertBefore = Node.prototype.insertBefore;
Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
  try {
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'NotFoundError') {
      return originalInsertBefore.call(this, newNode, null) as T;
    }
    throw e;
  }
};

const originalRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function <T extends Node>(child: T): T {
  try {
    return originalRemoveChild.call(this, child) as T;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'NotFoundError') {
      return child;
    }
    throw e;
  }
};

const root = createRoot(document.getElementById('root')!)

root.render(
  <PantallaAcceso titulo="Verificando acceso">
    <p role="status" className="mt-2 text-slate-600">Estamos comprobando tu sesión…</p>
  </PantallaAcceso>,
)

async function abrirSirepp() {
  try {
    const authenticated = await startSession()
    if (!authenticated) throw new Error('No se pudo iniciar sesión')

    const response = await api.get('/auth/session', { timeout: 10000 })
    if (response.status !== 204) throw new Error('No se pudo verificar el acceso')

    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (error) {
    const sinAcceso = isAxiosError(error) && error.response?.status === 403
    root.render(
      <PantallaAcceso titulo={sinAcceso ? 'Cuenta sin acceso a SIREPP' : 'No se pudo verificar tu acceso'}>
        <p role="alert" className="mt-2 text-slate-600">
          {sinAcceso
            ? 'Solicita a tu administrador que habilite tu cuenta en SIREPP.'
            : 'Intenta de nuevo en unos segundos. Si el problema continúa, contacta al administrador.'}
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-slate-800 px-4 py-3 font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
          onClick={() => {
            if (sinAcceso) {
              void endSession().catch(() => window.alert('No se pudo cerrar la sesión. Intenta nuevamente.'))
            } else {
              window.location.reload()
            }
          }}
        >
          {sinAcceso ? 'Cerrar sesión' : 'Reintentar'}
        </button>
      </PantallaAcceso>,
    )
  }
}

void abrirSirepp()