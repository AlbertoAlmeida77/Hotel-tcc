import { rotas } from '../services/rotas'

const itensMenu = [
  { id: 'painel', nome: 'Painel', icone: 'painel' },
  { id: 'quartos', nome: 'Quartos', icone: 'quartos' },
  { id: 'hospedes', nome: 'Hospedes', icone: 'hospedes' },
  { id: 'reservas', nome: 'Reservas', icone: 'reservas' },
  { id: 'transacoes', nome: 'Transacoes', icone: 'transacoes' },
]

function IconeMenu({ tipo }) {
  const icones = {
    painel: (
      <>
        <path d="M4 5h7v7H4z" />
        <path d="M13 5h7v4h-7z" />
        <path d="M13 11h7v8h-7z" />
        <path d="M4 14h7v5H4z" />
      </>
    ),
    quartos: (
      <>
        <path d="M4 11V5" />
        <path d="M4 17h16" />
        <path d="M20 17v3" />
        <path d="M4 20v-9h13a3 3 0 0 1 3 3v3" />
        <path d="M8 11V9a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
      </>
    ),
    hospedes: (
      <>
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    reservas: (
      <>
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M4 10h16" />
        <path d="M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        <path d="m9 15 2 2 4-4" />
      </>
    ),
    transacoes: (
      <>
        <path d="M4 7h16" />
        <path d="M4 11h16" />
        <path d="M7 15h4" />
        <path d="M6 19h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
      </>
    ),
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {icones[tipo]}
    </svg>
  )
}

function MenuLateral({ paginaAtual, onMudarPagina }) {
  function navegar(evento, pagina) {
    evento.preventDefault()
    onMudarPagina(pagina)
  }

  return (
    <aside className="menu-lateral">
      <div className="marca">
        <span className="marca-selo" aria-hidden="true">
          H
        </span>
        <strong>Hotel API</strong>
        <span>Gerenciamento</span>
      </div>

      <nav className="navegacao" aria-label="Menu principal">
        {itensMenu.map((item) => (
          <a
            className={paginaAtual === item.id ? 'nav-item ativo' : 'nav-item'}
            href={rotas[item.id]}
            key={item.nome}
            onClick={(evento) => navegar(evento, item.id)}
          >
            <span className="nav-icone" aria-hidden="true">
              <IconeMenu tipo={item.icone} />
            </span>
            {item.nome}
          </a>
        ))}
      </nav>
    </aside>
  )
}
export default MenuLateral
