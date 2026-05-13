import { rotas } from '../services/rotas'

const itensMenu = [
  { id: 'painel', nome: 'Painel' },
  { id: 'quartos', nome: 'Quartos' },
  { id: 'hospedes', nome: 'Hospedes' },
  { id: 'reservas', nome: 'Reservas' },
]

function MenuLateral({ paginaAtual, onMudarPagina }) {
  function navegar(evento, pagina) {
    evento.preventDefault()
    onMudarPagina(pagina)
  }

  return (
    <aside className="menu-lateral">
      <div className="marca">
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
            {item.nome}
          </a>
        ))}
      </nav>
    </aside>
  )
}
export default MenuLateral
