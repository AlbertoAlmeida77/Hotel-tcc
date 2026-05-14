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
          <span aria-hidden="true">?</span>
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
          <span aria-hidden="true">v</span>
        </button>

        <button type="button" onClick={onNovaReserva}>
          + Nova reserva
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
                        className="botao-pequeno"
                        onClick={() => onVisualizarReserva(reserva)}
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        className="botao-excluir botao-pequeno"
                        onClick={() => onExcluir(reserva)}
                      >
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
