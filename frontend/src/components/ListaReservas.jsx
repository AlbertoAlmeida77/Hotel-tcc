import { useMemo, useState } from 'react'
import {
  calcularDiarias,
  formatarCodigoReserva,
  formatarData,
} from '../services/financeiro'

const filtrosSituacao = [
  { valor: 'todas', texto: 'Todas' },
  { valor: 'pre-reservar', texto: 'Pre-reservado' },
  { valor: 'reservar', texto: 'Reservado' },
  { valor: 'hospedar', texto: 'Hospedado' },
  { valor: 'em limpeza', texto: 'Em limpeza' },
  { valor: 'finalizado', texto: 'Finalizado' },
  { valor: 'cancelado', texto: 'Cancelado' },
  { valor: 'bloquear datas', texto: 'Bloqueado' },
]

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
  onNovaReserva,
  onVisualizarReserva,
  onExcluir,
}) {
  const [busca, setBusca] = useState('')
  const [filtroSituacao, setFiltroSituacao] = useState('todas')

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
      const passouSituacao =
        filtroSituacao === 'todas' || reserva.situacao === filtroSituacao

      return passouBusca && passouSituacao
    })
  }, [busca, filtroSituacao, reservas])

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

        <button
          type="button"
          className="botao-filtro-reservas"
          title="Filtrar reservas"
        >
          <IconeReserva tipo="filtro" />
        </button>

        <button type="button" className="botao-com-icone" onClick={onNovaReserva}>
          <IconeReserva tipo="adicionar" />
          Nova reserva
        </button>
      </div>

      <div className="filtros-reservas" aria-label="Filtrar por situacao">
        {filtrosSituacao.map((filtro) => (
          <button
            type="button"
            className={
              filtroSituacao === filtro.valor
                ? `filtro-reserva ativo ${obterClasseSituacao(filtro.valor)}`
                : `filtro-reserva ${obterClasseSituacao(filtro.valor)}`
            }
            key={filtro.valor}
            onClick={() => setFiltroSituacao(filtro.valor)}
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

          <div className="reservas-cabecalho-acoes" aria-hidden="true">
            <span>↓</span>
            <span>-</span>
            <span>□</span>
          </div>
        </div>

        <div className="tabela-reservas-wrap">
          <table className="tabela-reservas">
            <thead>
              <tr>
                <th>N°</th>
                <th>Hospede</th>
                <th>UH</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Qtd.</th>
                <th>Situacao</th>
                <th>Acoes</th>
              </tr>
            </thead>

            <tbody>
              {reservasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="8" className="tabela-vazia">
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
                    <button
                      type="button"
                      className="link-reserva"
                      onClick={() => onVisualizarReserva(reserva)}
                    >
                      <span
                        className={`marcador-reserva ${obterClasseSituacao(
                          reserva.situacao,
                        )}`}
                        aria-hidden="true"
                      />
                      {formatarCodigoReserva(reserva.id_reserva)}
                    </button>
                  </td>
                  <td>{reserva.nome_hospede}</td>
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
                      {reserva.situacao}
                    </span>
                  </td>
                  <td>
                    <div className="acoes-tabela-reservas">
                      <button
                        type="button"
                        className="botao-pequeno botao-com-icone"
                        onClick={() => onVisualizarReserva(reserva)}
                      >
                        <IconeReserva tipo="abrir" />
                        Ver
                      </button>
                      <button
                        type="button"
                        className="botao-excluir botao-pequeno botao-com-icone"
                        onClick={() => onExcluir(reserva)}
                      >
                        <IconeReserva tipo="excluir" />
                        Excluir
                      </button>
                    </div>
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
