import { useEffect, useState } from 'react'
import { formatarData } from '../services/financeiro'

const indicadoresFixos = [
  { chave: 'todos', texto: 'todos', cor: 'neutro' },
  { chave: 'disponivel', texto: 'disponivel', cor: 'disponivel' },
  { chave: 'ocupado', texto: 'ocupado', cor: 'ocupado' },
  { chave: 'em-limpeza', texto: 'em limpeza', cor: 'limpeza' },
  { chave: 'bloqueado', texto: 'bloqueado', cor: 'bloqueado' },
]

function normalizarStatus(status) {
  const statusTratado = String(status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  if (statusTratado === 'disponivel') {
    return 'disponivel'
  }

  if (statusTratado === 'ocupado') {
    return 'ocupado'
  }

  if (
    statusTratado === 'em limpeza' ||
    statusTratado === 'limpeza' ||
    statusTratado === 'manutencao'
  ) {
    return 'em-limpeza'
  }

  if (statusTratado === 'bloqueado') {
    return 'bloqueado'
  }

  return 'disponivel'
}

function contarStatus(quartos, reservas, agora) {
  return quartos.reduce(
    (total, quarto) => {
      const { status } = obterEstadoDoQuarto(quarto, reservas, agora)

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

function criarDataLocal(data, hora = 0) {
  const [ano, mes, dia] = String(data).slice(0, 10).split('-').map(Number)

  return new Date(ano, mes - 1, dia, hora, 0, 0, 0)
}

function reservaContaNoPainel(reserva) {
  const situacao = String(reserva.situacao || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  return ![
    'bloquear datas',
    'cancelado',
    'finalizado',
  ].includes(situacao)
}

function obterReservasDoQuarto(quarto, reservas) {
  return reservas
    .filter(
      (reserva) =>
        Number(reserva.id_quarto) === Number(quarto.id_quarto) &&
        reservaContaNoPainel(reserva) &&
        reserva.data_entrada &&
        reserva.data_saida,
    )
    .map((reserva) => ({
      ...reserva,
      entrada: criarDataLocal(reserva.data_entrada),
      checkout: criarDataLocal(reserva.data_saida, 10),
      fimLimpeza: criarDataLocal(reserva.data_saida, 12),
    }))
}

function obterEstadoDoQuarto(quarto, reservas, agora) {
  const reservasDoQuarto = obterReservasDoQuarto(quarto, reservas)
  const reservaOcupada = reservasDoQuarto
    .filter(
      (reserva) => agora >= reserva.entrada && agora <= reserva.checkout,
    )
    .sort((reservaA, reservaB) => reservaA.entrada - reservaB.entrada)[0]

  if (reservaOcupada) {
    return {
      status: 'ocupado',
      textoStatus: 'Ocupado',
      reserva: reservaOcupada,
    }
  }

  const reservaEmLimpeza = reservasDoQuarto
    .filter(
      (reserva) => agora > reserva.checkout && agora <= reserva.fimLimpeza,
    )
    .sort((reservaA, reservaB) => reservaB.checkout - reservaA.checkout)[0]

  if (reservaEmLimpeza) {
    return {
      status: 'em-limpeza',
      textoStatus: 'Limpeza',
      reserva: reservaEmLimpeza,
    }
  }

  const statusManual = normalizarStatus(quarto.status)

  if (statusManual === 'bloqueado') {
    return {
      status: 'bloqueado',
      textoStatus: 'Bloqueado',
      reserva: null,
    }
  }

  return {
    status: 'disponivel',
    textoStatus: 'Disponivel',
    reserva: null,
  }
}

function IconeCama() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 11V5" />
      <path d="M4 16h16" />
      <path d="M20 16v3" />
      <path d="M4 19v-8h13a3 3 0 0 1 3 3v2" />
      <path d="M8 11V9a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function IconeReserva() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <path d="M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
    </svg>
  )
}

function IconeHospede() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

function IconeSaida() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  )
}

function DashboardQuartos({
  quartos,
  hospedes,
  reservas,
  onEditarHospede,
  onCriarHospedagem,
  onVerHospedagem,
  onAbrirCheckout,
}) {
  const [agora, setAgora] = useState(() => new Date())
  const totais = contarStatus(quartos, reservas, agora)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date())
    }, 60000)

    return () => clearInterval(intervalo)
  }, [])

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
          const { reserva, status, textoStatus } = obterEstadoDoQuarto(
            quarto,
            reservas,
            agora,
          )
          const hospede = hospedes.find(
            (hospedeAtual) =>
              Number(hospedeAtual.id_hospede) === Number(reserva?.id_hospede),
          )
          const estaOcupado = status === 'ocupado' && reserva
          const estaDisponivel = status === 'disponivel'
          const observacao = reserva?.observacao || quarto.descricao || ''
          const periodoReserva = reserva
            ? `${formatarData(reserva.data_entrada)} - ${formatarData(
                reserva.data_saida,
              )}`
            : ''
          const textoVazio =
            status === 'disponivel'
              ? 'Quarto livre para nova hospedagem.'
              : 'Sem informacoes adicionais no momento.'

          return (
            <article
              className={`card-quarto card-quarto-${status}`}
              key={quarto.id_quarto}
            >
              <header className="card-quarto-topo">
                <h3>QUARTO {quarto.numero}</h3>
                <span>{textoStatus}</span>
              </header>

              <div className="card-quarto-corpo">
                {observacao && (
                  <p className="observacao-quarto">{observacao}</p>
                )}

                {reserva?.nome_hospede && (
                  <div className="linha-card-quarto">
                    <span className="icone-card" aria-hidden="true">
                      i
                    </span>
                    <strong>{reserva.nome_hospede}</strong>
                  </div>
                )}

                {periodoReserva && (
                  <div className="linha-card-quarto periodo-card">
                    <span className="icone-card" aria-hidden="true">
                      #
                    </span>
                    <strong>{periodoReserva}</strong>
                  </div>
                )}

                {!observacao && !reserva?.nome_hospede && !periodoReserva && (
                  <p className="card-quarto-vazio">{textoVazio}</p>
                )}
              </div>

              <footer className="card-quarto-rodape">
                {estaDisponivel && (
                  <button
                    type="button"
                    className="botao-card-texto"
                    onClick={() => onCriarHospedagem(quarto)}
                  >
                    <IconeCama />
                    Hospedar
                  </button>
                )}

                {reserva && (
                  <button
                    type="button"
                    className="botao-icone-card"
                    title="Ver hospedagem"
                    aria-label="Ver hospedagem"
                    onClick={() => onVerHospedagem(reserva)}
                  >
                    <IconeReserva />
                  </button>
                )}

                <button
                  type="button"
                  className="botao-icone-card"
                  title="Editar informacoes do hospede"
                  aria-label="Editar informacoes do hospede"
                  disabled={!hospede}
                  onClick={() => onEditarHospede(hospede)}
                >
                  <IconeHospede />
                </button>

                <button
                  type="button"
                  className="botao-icone-card"
                  title="Abrir checkout"
                  aria-label="Abrir checkout"
                  disabled={!estaOcupado}
                  onClick={() => onAbrirCheckout(reserva)}
                >
                  <IconeSaida />
                </button>
              </footer>
            </article>
          )
        })}
      </section>
    </>
  )
}

export default DashboardQuartos
