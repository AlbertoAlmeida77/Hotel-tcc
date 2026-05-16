import { useMemo, useState } from 'react'
import {
  calcularDiarias,
  calcularTotalReserva,
  formatarCodigoReserva,
  formatarData,
  formatarMoeda,
} from '../services/financeiro'

const filtrosSituacao = [
  { valor: 'todas', texto: 'Todas' },
  { valor: 'pre-reservar', texto: 'Pre-reservado' },
  { valor: 'reservar', texto: 'Reservado' },
  { valor: 'hospedar', texto: 'Hospedado' },
  { valor: 'em limpeza', texto: 'Em limpeza' },
  { valor: 'finalizado', texto: 'Finalizado' },
  { valor: 'no show', texto: 'No show' },
  { valor: 'cancelado', texto: 'Cancelado' },
  { valor: 'bloquear datas', texto: 'Bloqueado' },
  { valor: 'historico', texto: 'Historico' },
]

const filtrosPadrao = ['pre-reservar', 'reservar', 'hospedar', 'em limpeza']
const filtrosSelecionaveis = filtrosSituacao
  .filter((filtro) => filtro.valor !== 'todas')
  .map((filtro) => filtro.valor)

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function obterClasseSituacao(situacao) {
  const situacaoNormalizada = normalizarTexto(situacao).replace(/\s+/g, '-')

  return `situacao-${situacaoNormalizada || 'padrao'}`
}

function reservaFinalizada(reserva) {
  return ['finalizado', 'finalizada'].includes(normalizarTexto(reserva.situacao))
}

function obterTextoSituacao(situacao) {
  const textos = {
    'pre-reservar': 'Pre-reservado',
    reservar: 'Reservado',
    hospedar: 'Hospedado',
    'em limpeza': 'Em limpeza',
    finalizado: 'Finalizado',
    finalizada: 'Finalizado',
    'no show': 'No show',
    cancelado: 'Cancelado',
    'bloquear datas': 'Bloqueado',
  }

  return textos[normalizarTexto(situacao)] || situacao || '-'
}

function IconeReserva({ tipo }) {
  const icones = {
    busca: (
      <>
        <path d="m21 21-4.3-4.3" />
        <circle cx="11" cy="11" r="7" />
      </>
    ),
    filtro: (
      <>
        <path d="M4 5h16" />
        <path d="M7 12h10" />
        <path d="M10 19h4" />
      </>
    ),
    adicionar: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    abrir: (
      <>
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </>
    ),
    excluir: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6 18 20H6L5 6" />
        <path d="M10 11v5" />
        <path d="M14 11v5" />
      </>
    ),
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {icones[tipo]}
    </svg>
  )
}

function ListaReservas({
  reservas,
  pagamentos,
  onNovaReserva,
  onFaturarReservas,
  onVisualizarReserva,
}) {
  const [busca, setBusca] = useState('')
  const [filtrosSelecionados, setFiltrosSelecionados] = useState(filtrosPadrao)
  const [reservasSelecionadas, setReservasSelecionadas] = useState([])

  const reservasFiltradas = useMemo(() => {
    const buscaNormalizada = normalizarTexto(busca)

    return reservas.filter((reserva) => {
      const textoReserva = normalizarTexto(
        [
          formatarCodigoReserva(reserva.id_reserva),
          reserva.nome_hospede,
          reserva.cpf_hospede,
          reserva.numero_quarto,
          reserva.tipo_quarto,
          reserva.situacao,
        ].join(' '),
      )
      const passouBusca = textoReserva.includes(buscaNormalizada)
      const passouSituacao = (() => {
        if (filtrosSelecionados.includes('historico') && reservaFinalizada(reserva)) {
          return reservaFinalizada(reserva)
        }

        if (
          filtrosSelecionados.includes('finalizado') &&
          reservaFinalizada(reserva)
        ) {
          return true
        }

        return filtrosSelecionados.includes(reserva.situacao)
      })()

      return passouBusca && passouSituacao
    })
  }, [busca, filtrosSelecionados, reservas])

  const reservasSelecionadasFiltradas = reservasFiltradas.filter((reserva) =>
    reservasSelecionadas.includes(String(reserva.id_reserva)),
  )
  const todasSelecionadas =
    reservasFiltradas.length > 0 &&
    reservasSelecionadasFiltradas.length === reservasFiltradas.length
  const totalPendenteSelecionado = reservasSelecionadasFiltradas.reduce(
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
    if (todasSelecionadas) {
      setReservasSelecionadas((selecionadasAtuais) =>
        selecionadasAtuais.filter(
          (idAtual) =>
            !reservasFiltradas.some(
              (reserva) => String(reserva.id_reserva) === idAtual,
            ),
        ),
      )
      return
    }

    setReservasSelecionadas((selecionadasAtuais) => [
      ...new Set([
        ...selecionadasAtuais,
        ...reservasFiltradas.map((reserva) => String(reserva.id_reserva)),
      ]),
    ])
  }

  function faturarSelecionadas() {
    onFaturarReservas(reservasSelecionadasFiltradas)
  }

  function alternarFiltroSituacao(valor) {
    if (valor === 'todas') {
      setFiltrosSelecionados((filtrosAtuais) =>
        filtrosAtuais.length === filtrosSelecionaveis.length
          ? filtrosPadrao
          : filtrosSelecionaveis,
      )
      return
    }

    setFiltrosSelecionados((filtrosAtuais) =>
      filtrosAtuais.includes(valor)
        ? filtrosAtuais.filter((filtroAtual) => filtroAtual !== valor)
        : [...filtrosAtuais, valor],
    )
  }

  function filtroEstaAtivo(valor) {
    if (valor === 'todas') {
      return filtrosSelecionados.length === filtrosSelecionaveis.length
    }

    return filtrosSelecionados.includes(valor)
  }

  return (
    <div className="reservas-listagem">
      <div className="reservas-breadcrumb">
        <span>Home</span>
        <strong>/ Reservas</strong>
      </div>

      <div className="reservas-toolbar">
        <label className="campo-busca-reservas">
          <span aria-hidden="true">
            <IconeReserva tipo="busca" />
          </span>
          <input
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Pesquise por N°, quarto, nome do hospede ou CPF"
          />
        </label>


        <button type="button" className="botao-com-icone" onClick={onNovaReserva}>
          <IconeReserva tipo="adicionar" />
          Nova reserva
        </button>

        <button
          type="button"
          className="botao-com-icone botao-faturar-reservas"
          disabled={reservasSelecionadasFiltradas.length === 0}
          onClick={faturarSelecionadas}
        >
          Faturar selecionadas
        </button>
      </div>

      <div className="filtros-reservas" aria-label="Filtrar por situacao">
        {filtrosSituacao.map((filtro) => (
          <button
            type="button"
            className={
              filtroEstaAtivo(filtro.valor)
                ? `filtro-reserva ativo ${obterClasseSituacao(filtro.valor)}`
                : `filtro-reserva ${obterClasseSituacao(filtro.valor)}`
            }
            key={filtro.valor}
            onClick={() => alternarFiltroSituacao(filtro.valor)}
          >
            {filtro.texto}
          </button>
        ))}
      </div>

      <div className="painel painel-reservas-tabela">
        <div className="painel-cabecalho reservas-cabecalho">
          <div>
            <h2>Lista de reservas</h2>
            <span>{reservasFiltradas.length} exibidas</span>
          </div>

          <div className="reservas-cabecalho-acoes">
            <strong>{reservasSelecionadasFiltradas.length} selecionada(s)</strong>
            <span>{formatarMoeda(totalPendenteSelecionado)} pendente</span>
          </div>
        </div>

        <div className="tabela-reservas-wrap">
          <table className="tabela-reservas">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Selecionar todas as reservas exibidas"
                    checked={todasSelecionadas}
                    onChange={alternarTodasReservas}
                  />
                </th>
                <th>Hospede</th>
                <th>UH</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Qtd.</th>
                <th>Situacao</th>
              </tr>
            </thead>

            <tbody>
              {reservasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="7" className="tabela-vazia">
                    Nenhuma reserva encontrada.
                  </td>
                </tr>
              )}

              {reservasFiltradas.map((reserva) => (
                <tr
                  className={`linha-tabela-reserva ${obterClasseSituacao(
                    reserva.situacao,
                  )}`}
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
                    <button
                      type="button"
                      className="link-reserva"
                      onClick={() => onVisualizarReserva(reserva)}
                    >
                      {reserva.nome_hospede}
                    </button>
                  </td>
                  <td>Quarto {reserva.numero_quarto}</td>
                  <td>{formatarData(reserva.data_entrada)}</td>
                  <td>{formatarData(reserva.data_saida)}</td>
                  <td>{calcularDiarias(reserva.data_entrada, reserva.data_saida)}</td>
                  <td>
                    <span
                      className={`pill-tabela-reserva ${obterClasseSituacao(
                        reserva.situacao,
                      )}`}
                    >
                      {obterTextoSituacao(reserva.situacao)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ListaReservas
