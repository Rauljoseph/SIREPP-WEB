import { Shield } from 'lucide-react'
import type { ReactNode } from 'react'

export function PantallaAcceso({
  titulo,
  children,
}: {
  titulo: string
  children?: ReactNode
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-900 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border-t-4 border-amber-700 bg-white p-7 shadow-xl sm:p-9">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-amber-700 text-white">
            <Shield aria-hidden="true" size={23} />
          </span>
          <div>
            <p className="font-bold tracking-wide">SIREPP</p>
            <p className="text-sm text-slate-600">Sistema de Registro y Reunificación de Placas</p>
          </div>
        </div>
        <h1 className="text-xl font-semibold">{titulo}</h1>
        {children}
      </section>
    </main>
  )
}
