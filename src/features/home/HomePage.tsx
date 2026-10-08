import { ArrowRight, BookOpen, CodeXml, FlaskConical, GraduationCap, KeyRound, Landmark, Library, PenTool, Search, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BookCard } from '../../components/books/BookCard'
import { BookCover } from '../../components/books/BookCover'
import { SearchBar } from '../../components/ui/SearchBar'
import { StatusPill } from '../../components/ui/StatusPill'
import { books } from '../../mocks/books'

const categories = [
  ['Literatura', BookOpen], ['Tecnologia', CodeXml], ['Educação', GraduationCap],
  ['Ciências', FlaskConical], ['História', Landmark], ['Design', PenTool],
] as const

export function HomePage() {
  return (
    <>
      <section className="bg-surface py-8 md:py-16">
        <div className="container-page grid items-center gap-7 md:grid-cols-[1.08fr_.92fr] md:gap-12">
          <div>
            <p className="eyebrow mb-5 inline-flex items-center gap-2"><Sparkles size={14} />Aberto a novas descobertas</p>
            <h1 className="max-w-xl text-[40px] font-normal leading-[1.02] md:text-[64px]">Seu próximo capítulo começa aqui.</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">Explore ideias, encontre sua próxima leitura e conecte-se ao acervo da sua universidade. O catálogo é aberto a todos.</p>
            <div className="mt-7 max-w-2xl"><SearchBar /></div>
            <p className="mt-3 text-[11px] text-subtle"><Search size={12} className="mr-1 inline" />Experimente: Machado de Assis, educação ou design</p>
          </div>
          <FeaturedHero />
        </div>
      </section>

      <section className="border-y border-line bg-canvas py-5">
        <div className="container-page grid gap-5 md:grid-cols-2 md:gap-12">
          <SourceLine icon={<BookOpen size={18} />} title="Descoberta com Open Library" text="Títulos, autores e informações bibliográficas em um catálogo público." />
          <SourceLine icon={<Library size={18} />} title="Acervo da universidade" text="Cópias físicas, empréstimos e reservas gerenciados pela nossa biblioteca." />
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Curadoria da biblioteca" title="Uma boa leitura muda tudo." action="Ver catálogo" />
          <p className="mt-3 text-sm text-muted">Clássicos e novas perspectivas para a sua próxima descoberta.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{books.slice(0, 4).map((b) => <BookCard key={b.id} book={b} dense />)}</div>
          <p className="mt-5 text-[10px] text-subtle">Informações bibliográficas: Open Library. Indicadores de cópias: biblioteca universitária.</p>
        </div>
      </section>

      <section className="bg-canvas py-14 md:py-20">
        <div className="container-page">
          <p className="eyebrow">Siga sua curiosidade</p><h2 className="section-title mt-3">Por onde você quer começar?</h2>
          <p className="mt-3 text-sm text-muted">Encontre leituras que conversam com a sua área — ou descubra uma nova.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6">{categories.map(([name, Icon]) => <Link key={name} to={`/catalogo?q=${name}`} className="card p-4 hover:border-primary"><Icon size={20} className="text-primary" /><strong className="mt-4 block text-sm font-medium">{name}</strong><span className="mt-2 block text-[11px] text-subtle">Explorar →</span></Link>)}</div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-page grid items-center gap-9 md:grid-cols-2 md:gap-20">
          <div className="flex items-end justify-center gap-4 rounded-2xl bg-stage p-8"><BookCover book={books[3]} /><BookCover book={books[2]} /></div>
          <div><p className="eyebrow">Um encontro com nossas histórias</p><h2 className="section-title mt-3">Vozes brasileiras. Horizontes sem fim.</h2><p className="mt-5 text-sm leading-relaxed text-muted">De Machado a Carolina, descubra narrativas que atravessam o tempo e ampliam a forma de olhar o mundo.</p><Link className="btn-outline mt-7" to="/catalogo?q=Literatura brasileira">Explorar literatura brasileira</Link><p className="mt-5 text-[10px] leading-relaxed text-subtle">O catálogo reúne obras com e sem cópias físicas na universidade. Confira a disponibilidade em cada livro.</p></div>
        </div>
      </section>

      <section id="como-funciona" className="bg-canvas py-14 md:py-20">
        <div className="container-page"><p className="eyebrow">Simples, do início ao fim</p><h2 className="section-title mt-3">Da descoberta à sua próxima leitura.</h2><div className="mt-8 grid gap-4 md:grid-cols-3"><Step n="01" title="Explore sem barreiras" text="Pesquise por título, autor ou assunto no catálogo público da Open Library." /><Step n="02" title="Confira o acervo físico" text="Veja se a universidade possui o livro e quantas cópias estão disponíveis." /><Step n="03" title="Entre para solicitar" text="Use sua conta institucional para pedir um empréstimo ou entrar na fila de reserva." /></div></div>
      </section>

      <section className="py-14 md:py-20"><div className="container-page grid gap-10 md:grid-cols-2"><div><p className="eyebrow">Transparência em cada livro</p><h2 className="section-title mt-3">Um catálogo amplo. Um acervo bem identificado.</h2><p className="mt-5 text-sm leading-relaxed text-muted">A descoberta vem da Open Library. A disponibilidade física vem exclusivamente da biblioteca universitária.</p></div><div className="space-y-5"><Availability status="available" title="Disponível na universidade" text="Há cópias físicas livres. Entre para solicitar um empréstimo." /><Availability status="borrowed" title="Todos os exemplares emprestados" text="O livro faz parte do acervo. Entre para solicitar uma reserva." /><Availability status="catalog-only" title="Somente no catálogo" text="Sem cópias na universidade. Disponível apenas para descoberta bibliográfica." /></div></div></section>

      <section className="bg-[#0B1428] py-11 text-white"><div className="container-page flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div><p className="eyebrow text-blue-300">Sua jornada, conectada</p><h2 className="mt-2 text-3xl">A biblioteca também é sua.</h2><p className="mt-3 max-w-2xl text-sm text-slate-300">Acesse a área do aluno para acompanhar empréstimos e reservas. As áreas de aluno e administração exigem autenticação.</p></div><Link className="btn-primary w-full md:w-auto" to="/entrar"><KeyRound size={18} />Entrar na minha conta</Link></div></section>

      <Faq />
    </>
  )
}

function FeaturedHero() { const book = books[0]; return <div className="relative min-h-[320px] overflow-hidden rounded-2xl bg-slate-900 md:min-h-[460px]"><img src="/assets/library-hero.png" alt="Interior de uma biblioteca universitária" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/10" /><div className="absolute inset-x-5 bottom-5 flex items-end gap-4"><BookCover book={book} /><div className="pb-2 text-white"><span className="text-[9px] uppercase">Escolha da biblioteca</span><h2 className="mt-2 text-2xl font-semibold">Dom Casmurro</h2><p className="mt-1 text-xs text-slate-200">Machado de Assis</p><div className="mt-3"><StatusPill status="available" count={3} /></div><Link to="/livros/dom-casmurro" className="mt-4 block text-xs font-semibold">Conhecer o livro →</Link></div></div></div> }
function SourceLine({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="flex gap-3 text-primary">{icon}<div><strong className="block text-xs text-ink">{title}</strong><span className="mt-1 block text-[10px] text-subtle">{text}</span></div></div> }
function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action: string }) { return <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">{eyebrow}</p><h2 className="section-title mt-3">{title}</h2></div><Link className="shrink-0 text-xs font-semibold text-primary" to="/catalogo">{action} →</Link></div> }
function Step({ n, title, text }: { n: string; title: string; text: string }) { return <div className="card p-6"><span className="text-sm font-semibold text-primary">{n}</span><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-3 text-xs leading-relaxed text-muted">{text}</p></div> }
function Availability({ status, title, text }: { status: 'available' | 'borrowed' | 'catalog-only'; title: string; text: string }) { return <div className="border-b border-line pb-5"><StatusPill status={status} count={3} long /><h3 className="mt-2 text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-muted">{text}</p></div> }
function Faq() { const qs=[['Preciso entrar para pesquisar livros?','Não. O catálogo público pode ser explorado por qualquer pessoa, sem cadastro ou login.'],['Todo livro do catálogo pode ser emprestado?','Não. A Open Library oferece a descoberta bibliográfica. Só os livros com cópias na universidade podem ser solicitados.'],['Como funcionam os empréstimos e as reservas?','Entre com sua conta institucional e consulte o livro. A solicitação depende do vínculo ativo e das regras da biblioteca universitária.']]; return <section className="py-14 md:py-20"><div className="container-page grid gap-9 md:grid-cols-[.75fr_1.25fr]"><div><p className="eyebrow">Antes de começar</p><h2 className="section-title mt-3">Dúvidas, sem complicação.</h2><p className="mt-3 text-sm text-muted">Tudo o que você precisa saber para explorar e usar o acervo universitário.</p></div><div>{qs.map(([q,a])=><details key={q} className="border-b border-line py-5" open={q.startsWith('Preciso')}><summary className="cursor-pointer list-none text-sm font-semibold">{q}</summary><p className="mt-3 text-xs leading-relaxed text-muted">{a}</p></details>)}</div></div></section> }
