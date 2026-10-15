import { Link } from 'react-router-dom'

export function NotFoundPage() { return <main className="container-page flex min-h-[65vh] flex-col items-center justify-center text-center"><p className="eyebrow">Erro 404</p><h1 className="mt-4 text-4xl">Página não encontrada.</h1><p className="mt-3 text-sm text-muted">O endereço pode ter mudado ou não existe.</p><Link to="/" className="btn-primary mt-7">Voltar ao início</Link></main> }
