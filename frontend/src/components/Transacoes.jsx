import {
  calcularTotalReserva,
  formatarCodigoReserva,
  formatarData,
  formatarMoeda,
} from '../services/financeiro'

function Transacoes({ reservas, pagamentos, onAdicionarPagamento }) {
  const totalHospedagens = reservas.reduce(
    (total, reserva) => total + calcularTotalReserva(reserva),
    0,
  )
  const totalRecebido = pagamentos.reduce(
    (total, pagamento) =>
      pagamento.concluido ? total + Number(pagamento.valor || 0) : total,
    0,
  )
  const faltaReceber = totalHospedagens - totalRecebido

  return (
    <>
      <div className="grade grade-transacoes">
        <div className="painel resumo-destaque">
          <span>Total hospedagens</span>
          <strong>{formatarMoeda(totalHospedagens)}</strong>
        </div>
        <div className="painel resumo-destaque resumo-recebido">
          <span>Recebido</span>
          <strong>{formatarMoeda(totalRecebido)}</strong>
        </div>
        <div className="painel resumo-destaque resumo-pendente">
          <span>Falta receber</span>
          <strong>{formatarMoeda(faltaReceber)}</strong>
        </div>
      </div>

      <div className="painel">
        <div className="painel-cabecalho">
          <div>
            <h2>Transacoes</h2>
            <span>Pagamentos vinculados as reservas</span>
          </div>
        </div>

        <div className="lista">
          {reservas.length === 0 && (
            <p className="vazio">Nenhuma reserva para gerar transacoes.</p>
          )}

          {reservas.map((reserva) => {
            const totalReserva = calcularTotalReserva(reserva)
            const pagamentosReserva = pagamentos.filter(
              (pagamento) =>
                Number(pagamento.id_reserva) === Number(reserva.id_reserva),
            )
            const recebidoReserva = pagamentosReserva.reduce(
              (total, pagamento) =>
                pagamento.concluido
                  ? total + Number(pagamento.valor || 0)
                  : total,
              0,
            )
            const pendenteReserva = totalReserva - recebidoReserva

            return (
              <article className="item item-transacao" key={reserva.id_reserva}>
                <div>
                  <strong>{formatarCodigoReserva(reserva.id_reserva)}</strong>
                  <p>
                    Quarto {reserva.numero_quarto} - {reserva.nome_hospede}
                  </p>
                </div>

                <div className="detalhes">
                  <span>Total {formatarMoeda(totalReserva)}</span>
                  <span>Recebido {formatarMoeda(recebidoReserva)}</span>
                  <span>Pendente {formatarMoeda(pendenteReserva)}</span>
                </div>

                <div className="acoes-item">
                  <button
                    type="button"
                    className="botao-pequeno"
                    onClick={() => onAdicionarPagamento(reserva)}
                  >
                    + Pagamento
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <div className="painel">
        <div className="painel-cabecalho">
          <div>
            <h2>Pagamentos lancados</h2>
            <span>{pagamentos.length} registros</span>
          </div>
        </div>

        <div className="lista">
          {pagamentos.length === 0 && (
            <p className="vazio">Nenhum pagamento lancado ainda.</p>
          )}

          {pagamentos.map((pagamento) => (
            <article className="item item-transacao" key={pagamento.id}>
              <div>
                <strong>{pagamento.descricao}</strong>
                <p>
                  {pagamento.forma} - {pagamento.conta}
                </p>
              </div>

              <div className="detalhes">
                <span>{pagamento.categoria}</span>
                <span>Vence {formatarData(pagamento.vencimento)}</span>
                <span>
                  {pagamento.concluido ? 'Concluido' : 'Em aberto'}
                </span>
              </div>

              <strong className="valor-transacao">
                {formatarMoeda(pagamento.valor)}
              </strong>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export default Transacoes
