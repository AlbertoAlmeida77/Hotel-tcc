const statusPrincipais = ['Disponivel', 'Ocupado', 'Em limpeza', 'Bloqueado']

const indicadoresFixos = [
  { chave: 'todos', texto: 'todos', cor: 'neutro' },
  { chave: 'disponivel', texto: 'disponivel', cor: 'disponivel' },
  { chave: 'ocupado', texto: 'ocupado', cor: 'ocupado' },
  { chave: 'em-limpeza', texto: 'em limpeza', cor: 'limpeza' },
  { chave: 'bloqueado', texto: 'bloqueado', cor: 'bloqueado' },
]

function normalizarStatus(status) {
  const statusTratado = String(status || '').toLowerCase().trim()

  if (statusTratado === 'disponivel' || statusTratado === 'disponível') {
    return 'disponivel'
  }

  if (statusTratado === 'ocupado') {
    return 'ocupado'
  }

  if (
    statusTratado === 'em limpeza' ||
    statusTratado === 'limpeza' ||
    statusTratado === 'manutencao' ||
    statusTratado === 'manutenção'
  ) {
    return 'em-limpeza'
  }

  if (statusTratado === 'bloqueado') {
    return 'bloqueado'
  }

  return 'disponivel'
}

function obterCorStatus(status) {
  const statusNormalizado = normalizarStatus(status)

  const cores = {
    disponivel: '#16a34a',
    ocupado: '#dc2626',
    'em-limpeza': '#94a3b8',
    bloqueado: '#1e293b',
  }

  return cores[statusNormalizado] || cores.disponivel
}

function obterStatusParaSelect(status) {
  const statusNormalizado = normalizarStatus(status)

  const statusPorChave = {
    disponivel: 'Disponivel',
    ocupado: 'Ocupado',
    'em-limpeza': 'Em limpeza',
    bloqueado: 'Bloqueado',
  }

  return statusPorChave[statusNormalizado] || 'Disponivel'
}

function contarStatus(quartos) {
  return quartos.reduce(
    (total, quarto) => {
      const status = normalizarStatus(quarto.status)

      return {
        ...total,
        todos: total.todos + 1,
        [status]: total[status] + 1,
      }
    },
    {
      todos: 0,
      disponivel: 0,
      ocupado: 0,
      'em-limpeza': 0,
      bloqueado: 0,
    },
  )
}

function DashboardQuartos({ quartos, onAlterarStatus }) {
  const totais = contarStatus(quartos)

  return (
    <>
      <section className="hero-dashboard">
        <div>
          <span className="etiqueta-dashboard">Bem-vindo</span>
          <h2>Hotel Auto Posto Itaguari</h2>
          <p>Sistema de gestao de quartos, reservas e hospedes.</p>
        </div>
      </section>

      <section className="indicadores" aria-label="Resumo dos quartos">
        {indicadoresFixos.map((indicador) => (
          <span
            className={`indicador indicador-${indicador.cor}`}
            key={indicador.chave}
          >
            {indicador.texto}: {totais[indicador.chave]}
          </span>
        ))}
      </section>

      <section className="grade-quartos-dashboard">
        {quartos.length === 0 && (
          <p className="aviso">Nenhum quarto cadastrado ainda.</p>
        )}

        {quartos.map((quarto) => {
          const statusNormalizado = normalizarStatus(quarto.status)
          const podeHospedar = statusNormalizado === 'disponivel'

          return (
            <article className="card-quarto" key={quarto.id_quarto}>
              <header className="card-quarto-topo">
                <h3>QUARTO {quarto.numero}</h3>

                <div className="controle-status">
                  <span
                    className="bolinha-status"
                    style={{ backgroundColor: obterCorStatus(quarto.status) }}
                    title={quarto.status}
                  />

                  <select
                    aria-label={`Alterar status do quarto ${quarto.numero}`}
                    value={obterStatusParaSelect(quarto.status)}
                    onChange={(evento) =>
                      onAlterarStatus(quarto, evento.target.value)
                    }
                  >
                    {statusPrincipais.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </header>

              <div className="card-quarto-corpo">
                <p>{quarto.tipo}</p>
                <span>Capacidade: {quarto.capacidade} pessoa(s)</span>
                <span>Diaria: R$ {Number(quarto.valor_diaria).toFixed(2)}</span>
              </div>

              <footer className="card-quarto-rodape">
                {podeHospedar ? (
                  <button type="button" className="botao-hospedar">
                    Hospedar
                  </button>
                ) : (
                  <span className="sem-acao">Hospedagem indisponivel</span>
                )}
              </footer>
            </article>
          )
        })}
      </section>
    </>
  )
}

export default DashboardQuartos
