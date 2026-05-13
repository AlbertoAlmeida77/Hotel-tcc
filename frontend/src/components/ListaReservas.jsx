function ListaReservas({ reservas, onNovaReserva, onVisualizarReserva }) {
  function formatarCodigo(idReserva) {
    return `HO:${String(idReserva).padStart(6, '0')}`
  }

  function formatarData(data) {
    if (!data) {
      return '-'
    }

    return new Date(data).toLocaleDateString('pt-BR')
  }

  return (
    <>
      <div className="barra-acoes">
        <button type="button" onClick={onNovaReserva}>
          Nova reserva
        </button>
      </div>

      <div className="painel">
        <div className="painel-cabecalho">
          <h2>Reservas</h2>
          <span>{reservas.length} cadastradas</span>
        </div>

        <div className="lista">
          {reservas.length === 0 && (
            <p className="vazio">Nenhuma reserva cadastrada ainda.</p>
          )}

          {reservas.map((reserva) => (
            <article className="item item-reserva" key={reserva.id_reserva}>
              <div>
                <strong>Reserva {formatarCodigo(reserva.id_reserva)}</strong>
                <p>{reserva.nome_hospede}</p>
              </div>

              <div className="detalhes">
                <span>{reserva.situacao}</span>
                <span>Quarto {reserva.numero_quarto}</span>
                <span>
                  {formatarData(reserva.data_entrada)} ate{' '}
                  {formatarData(reserva.data_saida)}
                </span>
              </div>

              <div className="acoes-item">
                <button
                  type="button"
                  className="botao-pequeno"
                  onClick={() => onVisualizarReserva(reserva)}
                >
                  Ver reserva
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export default ListaReservas
