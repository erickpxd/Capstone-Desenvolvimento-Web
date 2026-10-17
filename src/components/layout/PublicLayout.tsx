import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { PublicHeader } from './PublicHeader'

export function PublicLayout() {
  return <div className="flex min-h-screen flex-col"><a href="#conteudo-principal" className="fixed left-3 top-3 z-50 -translate-y-20 rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-transform focus:translate-y-0">Pular para o conteúdo</a><PublicHeader /><main id="conteudo-principal" className="flex-1" tabIndex={-1}><Outlet /></main><Footer /></div>
}
