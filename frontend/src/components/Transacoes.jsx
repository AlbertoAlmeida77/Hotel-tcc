import { useState } from 'react'
import {
  calcularTotalReserva,
  formatarCodigoReserva,
  formatarData,
  formatarMoeda,
} from '../services/financeiro'

function obterStatusPagamento(total, recebido) {
  const pendente = Math.max(total - recebido, 0)

  if (pendente <= 0 && total > 0) {
    return {
      classe: 'pago',
      texto: 'Pago',
    }
  }

  if (recebido > 0) {
    return {
      classe: 'parcial',
      texto: 'Parcial',
    }
  }

  return {
    classe: 'pendente',
    texto: 'Pendente',
  }
}

function Transacoes({
  reservas,
  pagamentos,
  onAdicionarPagamento,
  onExcluirPagamento,
  onFaturarReservas,
}) {
  const [reservasSelecionadas, setReservasSelecionadas] = useState([])
  const totalHospedagens = reservas.reduce(
    (total, reserva) => total + calcularTotalReserva(reserva),
    0,
  )
  const pagamentosVinculados = pagamentos.filter(
    (pagamento) =>
      pagamento.id_reserva !== undefined &&
      pagamento.id_reserva !== null &&
      pagamento.id_reserva !== '',
  )
  const faturamentosAvulsos = pagamentos.filter(
    (pagamento) =>
      pagamento.id_reserva === undefined ||
      pagamento.id_reserva === null ||
      pagamento.id_reserva === '',
  )
  const totalRecebido = pagamentosVinculados.reduce(
    (total, pagamento) =>
      pagamento.concluido ? total + Number(pagamento.valor || 0) : total,
    0,
  )
  const faltaReceber = totalHospedagens - totalRecebido
  const totalAvulso = faturamentosAvulsos.reduce(
    (total, pagamento) => total + Number(pagamento.valor || 0),
    0,
  )
  const reservasSelecionadasLista = reservas.filter((reserva) =>
    reservasSelecionadas.includes(String(reserva.id_reserva)),
  )
  const todasSelecionadas =
    reservas.length > 0 && reservasSelecionadasLista.length === reservas.length
  const totalPendenteSelecionado = reservasSelecionadasLista.reduce(
    (total, reserva) => {
      const totalReserva = calcularTotalReserva(reserva)
      const recebido = pagamentos
        .filter(
          (pagamento) =>
            Number(pagamento.id_reserva) === Number(reserva.id_reserva) &&
            pagamento.concluido,
        )
        .reduce((soma, pagamento) => soma + Number(pagamento.valor || 0), 0)

      return total + Math.max(totalReserva - recebido, 0)
    },
    0,
  )

  function alternarReservaSelecionada(idReserva) {
    const idTratado = String(idReserva)

    setReservasSelecionadas((selecionadasAtuais) =>
      selecionadasAtuais.includes(idTratado)
        ? selecionadasAtuais.filter((idAtual) => idAtual !== idTratado)
        : [...selecionadasAtuais, idTratado],
    )
  }

  function alternarTodasReservas() {
    setReservasSelecionadas(
      todasSelecionadas
        ? []
        : reservas.map((reserva) => String(reserva.id_reserva)),
    )
  }

  function faturarSelecionadas() {
    onFaturarReservas(reservasSelecionadasLista)
  }

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

      <div className="painel painel-transacoes">
        <div className="painel-cabecalho">
          <div>
            <h2>Controle de pagamentos</h2>
            <span>{reservas.length} hospedagens acompanhadas</span>
          </div>
          <div className="transacoes-acoes-lote">
            <span>
              {reservasSelecionadasLista.length} selecionada(s) -{' '}
              {formatarMoeda(totalPendenteSelecionado)}
            </span>
            <button
              type="button"
              className="botao-pequeno"
              disabled={reservasSelecionadasLista.length === 0}
              onClick={faturarSelecionadas}
            >
              Faturar selecionadas
            </button>
          </div>
        </div>

        <div className="tabela-transacoes-wrap">
          <table className="tabela-transacoes">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Selecionar todas as hospedagens"
                    checked={todasSelecionadas}
                    onChange={alternarTodasReservas}
                  />
                </th>
                <th>Hospedagem</th>
                <th>Hospede</th>
                <th>Quarto</th>
                <th>Total</th>
                <th>Recebido</th>
                <th>Pendente</th>
                <th>Status</th>
                <th>Acao</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length === 0 && (
                <tr className="tabela-vazia">
                  <td colSpan="9">Nenhuma hospedagem para gerar transacoes.</td>
                </tr>
              )}

              {reservas.map((reserva) => {
                const totalReserva = calcularTotalReserva(reserva)
                const pagamentosReserva = pagamentos.filter(
                  (pagamento) =>
                    pagamento.id_reserva !== undefined &&
                    pagamento.id_reserva !== null &&
                    Number(pagamento.id_reserva) ===
                      Number(reserva.id_reserva),
                )
                const recebidoReserva = pagamentosReserva.reduce(
                  (total, pagamento) =>
                    pagamento.concluido
                      ? total + Number(pagamento.valor || 0)
                      : total,
                  0,
                )
                const pendenteReserva = Math.max(
                  totalReserva - recebidoReserva,
                  0,
                )
                const status = obterStatusPagamento(
                  totalReserva,
                  recebidoReserva,
                )

                return (
                  <tr
                    className={`linha-transacao linha-transacao-${status.classe}`}
                    key={reserva.id_reserva}
                  >
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Selecionar ${formatarCodigoReserva(
                          reserva.id_reserva,
                        )}`}
                        checked={reservasSelecionadas.includes(
                          String(reserva.id_reserva),
                        )}
                        onChange={() =>
                          alternarReservaSelecionada(reserva.id_reserva)
                        }
                      />
                    </td>
                    <td>
                      <strong>{formatarCodigoReserva(reserva.id_reserva)}</strong>
                    </td>
                    <td>{reserva.nome_hospede || 'Hospede nao informado'}</td>
                    <td>Quarto {reserva.numero_quarto || '-'}</td>
                    <td>{formatarMoeda(totalReserva)}</td>
                    <td className="valor-recebido">
                      {formatarMoeda(recebidoReserva)}
                    </td>
                    <td className="valor-pendente">
                      {formatarMoeda(pendenteReserva)}
                    </td>
                    <td>
                      <span className={`badge-pagamento badge-${status.classe}`}>
                        {status.texto}
                      </span>
                    </td>
                    <td className="acao-transacao">
                      <button
                        type="button"
                        className="botao-pequeno"
                        onClick={() => onAdicionarPagamento(reserva)}
                      >
                        Registrar pagamento
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="painel painel-transacoes">
        <div className="painel-cabecalho">
          <div>
            <h2>Faturamentos avulsos</h2>
            <span>
              {faturamentosAvulsos.length} registro(s) -{' '}
              {formatarMoeda(totalAvulso)}
            </span>
          </div>
        </div>

        <div className="lista">
          {faturamentosAvulsos.length === 0 && (
            <p className="vazio">Nenhum faturamento avulso lancado.</p>
          )}

          {faturamentosAvulsos.map((pagamento) => (
            <article className="item item-transacao" key={pagamento.id}>
              <div>
                <strong>{pagamento.descricao}</strong>
                <p>
                  {pagamento.faturarPara
                    ? `Faturar para: ${pagamento.faturarPara}`
                    : 'Sem destinatario informado'}
                </p>
                {pagamento.quartos_faturados?.length > 0 && (
                  <p>
                    {pagamento.quartos_faturados
                      .map((quarto) => `Quarto ${quarto.numero}`)
                      .join(', ')}{' '}
                    - {formatarData(pagamento.data_entrada)} ate{' '}
                    {formatarData(pagamento.data_saida)}
                  </p>
                )}
              </div>

              <strong className="valor-transacao">
                {formatarMoeda(pagamento.valor)}
              </strong>

              <div className="detalhes">
                <span>{pagamento.categoria}</span>
                <span>{pagamento.forma || 'Forma pendente'}</span>
                <span>{pagamento.concluido ? 'Pago' : 'Pendente'}</span>
                {pagamento.diarias > 0 && (
                  <span>{pagamento.diarias} diaria(s)</span>
                )}
              </div>

              <button
                type="button"
                className="botao-excluir botao-pequeno"
                onClick={() => onExcluirPagamento(pagamento)}
              >
                Excluir
              </button>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export default Transacoes
