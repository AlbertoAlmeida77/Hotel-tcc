import { useEffect, useState } from 'react'
import {
  calcularDiarias,
  formatarCodigoReserva,
  formatarMoeda,
} from '../services/financeiro'

function obterClasseSituacao(situacao) {
  const situacaoNormalizada = String(situacao || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')

  return `situacao-${situacaoNormalizada || 'padrao'}`
}

function criarFormulario(reserva) {
  return {
    ...reserva,
    id_hospede: String(reserva.id_hospede || ''),
    id_quarto: String(reserva.id_quarto || ''),
    data_entrada: String(reserva.data_entrada || '').slice(0, 10),
    data_saida: String(reserva.data_saida || '').slice(0, 10),
    valor_diaria: reserva.valor_diaria || '',
    adultos: String(reserva.adultos || 1),
    criancas: String(reserva.criancas || 0),
    observacao: reserva.observacao || '',
  }
}

function IconeAcaoReserva({ tipo }) {
  const icones = {
    cancelar: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m5.8 5.8 12.4 12.4" />
      </>
    ),
    finalizar: (
      <>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="m10 17 5-5-5-5" />
        <path d="M15 12H3" />
      </>
    ),
    atualizar: (
      <>
        <path d="M21 12a9 9 0 0 1-15.5 6.2" />
        <path d="M3 12a9 9 0 0 1 15.5-6.2" />
        <path d="M18 2v4h-4" />
        <path d="M6 22v-4h4" />
      </>
    ),
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {icones[tipo]}
    </svg>
  )
}

function DetalhesReserva({
  reserva,
  quartos,
  hospedes,
  pagamentos,
  onAdicionarPagamento,
  onAtualizarReserva,
  onCancelarReserva,
  onExcluirPagamento,
  onFinalizarCheckout,
  onReabrirReserva,
  onVoltar,
}) {
  const [formulario, setFormulario] = useState(() => criarFormulario(reserva))

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setFormulario(criarFormulario(reserva))
  }, [reserva])
  /* eslint-enable react-hooks/set-state-in-effect */

  const diarias = calcularDiarias(formulario.data_entrada, formulario.data_saida)
  const valorDiaria = Number(formulario.valor_diaria || 0)
  const totalDiarias = diarias * valorDiaria
  const total = totalDiarias
  const recebido = pagamentos.reduce(
    (soma, pagamento) =>
      pagamento.concluido ? soma + Number(pagamento.valor || 0) : soma,
    0,
  )
  const faltaLancar = Math.max(total - recebido, 0)
  const reservaCancelada = reserva.situacao === 'cancelado'
  const reservaFinalizada = ['finalizado', 'finalizada'].includes(
    reserva.situacao,
  )
  const camposBloqueados = reservaCancelada || reservaFinalizada

  function atualizarCampo(evento) {
    const { checked, name, type, value } = evento.target
    const novoValor = type === 'checkbox' ? checked : value

    setFormulario((formularioAtual) => {
      if (name === 'id_quarto') {
        const quartoSelecionado = quartos.find(
          (quarto) => String(quarto.id_quarto) === value,
        )

        return {
          ...formularioAtual,
          id_quarto: value,
          valor_diaria: quartoSelecionado?.valor_diaria || formularioAtual.valor_diaria,
        }
      }

      return {
        ...formularioAtual,
        [name]: novoValor,
      }
    })
  }

  function salvarAlteracoes(evento) {
    evento.preventDefault()
    onAtualizarReserva(formulario, { voltarParaLista: false })
  }

  return (
    <>
      <div className="barra-acoes">
        {!camposBloqueados && (
          <button
            type="button"
            className="botao-pagamento-topo"
            onClick={() => onAdicionarPagamento(reserva)}
            title="Adicionar pagamento"
          >
            + Pagamento
          </button>
        )}
        <button type="button" className="botao-secundario" onClick={onVoltar}>
          Voltar para reservas
        </button>
      </div>

      <div className="layout-reserva">
        <section className="formulario reserva-formulario">
          <form onSubmit={salvarAlteracoes}>
            <div className="painel-cabecalho">
              <div>
                <h2>Reserva {formatarCodigoReserva(reserva.id_reserva)}</h2>
                <span>Dados da reserva e hospedagem.</span>
              </div>
              <span
                className={`pill-situacao ${obterClasseSituacao(
                  reserva.situacao,
                )}`}
              >
                {reserva.situacao}
              </span>
            </div>

            <div className="campos reserva-detalhes-campos">
              <label>
                Situação
                <input value={reserva.situacao} disabled />
              </label>

              <label>
                Hóspede
                <select
                  name="id_hospede"
                  value={formulario.id_hospede}
                  onChange={atualizarCampo}
                  disabled={camposBloqueados}
                  required
                >
                  <option value="">Selecione um hospede</option>
                  {hospedes.map((hospede) => (
                    <option value={hospede.id_hospede} key={hospede.id_hospede}>
                      {hospede.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quarto
                <select
                  name="id_quarto"
                  value={formulario.id_quarto}
                  onChange={atualizarCampo}
                  disabled={camposBloqueados}
                  required
                >
                  <option value="">Selecione um quarto</option>
                  {quartos.map((quarto) => (
                    <option value={quarto.id_quarto} key={quarto.id_quarto}>
                      Quarto {quarto.numero}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Entrada
                <input
                  type="date"
                  name="data_entrada"
                  value={formulario.data_entrada}
                  onChange={atualizarCampo}
                  disabled={camposBloqueados}
                  required
                />
              </label>

              <label>
                Saída
                <input
                  type="date"
                  name="data_saida"
                  value={formulario.data_saida}
                  onChange={atualizarCampo}
                  disabled={camposBloqueados}
                  required
                />
              </label>

              <label>
                Valor da diária
                <input
                  type="number"
                  name="valor_diaria"
                  min="0"
                  step="0.01"
                  value={formulario.valor_diaria}
                  onChange={atualizarCampo}
                  disabled={camposBloqueados}
                  required
                />
              </label>

              <label>
                Adultos
                <input
                  type="number"
                  name="adultos"
                  min="1"
                  value={formulario.adultos}
                  onChange={atualizarCampo}
                  disabled={camposBloqueados}
                  required
                />
              </label>

              <label>
                Criancas
                <input
                  type="number"
                  name="criancas"
                  min="0"
                  value={formulario.criancas}
                  onChange={atualizarCampo}
                  disabled={camposBloqueados}
                />
              </label>

              <label className="campo-largo">
                Observação
                <textarea
                  name="observacao"
                  value={formulario.observacao}
                  onChange={atualizarCampo}
                  disabled={camposBloqueados}
                  rows="5"
                />
              </label>
            </div>

            <div className="acoes-formulario acoes-com-espaco">
              {reservaCancelada ? (
                <button
                  type="button"
                  className="botao-hospedar-reserva"
                  onClick={() => onReabrirReserva(reserva)}
                >
                  Reabrir reserva
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="botao-acao-reserva botao-reserva-cancelar"
                    disabled={reservaFinalizada}
                    onClick={() => onCancelarReserva(reserva)}
                  >
                    <IconeAcaoReserva tipo="cancelar" />
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="botao-acao-reserva botao-reserva-finalizar"
                    disabled={reservaFinalizada}
                    onClick={() => onFinalizarCheckout(reserva)}
                    title="Finalizar reserva"
                  >
                    <IconeAcaoReserva tipo="finalizar" />
                    Finalizar
                  </button>
                  <button
                    type="submit"
                    className="botao-acao-reserva botao-reserva-atualizar"
                  >
                    <IconeAcaoReserva tipo="atualizar" />
                    Atualizar Reserva
                  </button>
                </>
              )}
            </div>
          </form>
        </section>

        <aside className="resumo-reserva">
          <div className="painel resumo-destaque">
            <span>Falta lançar</span>
            <strong>{formatarMoeda(faltaLancar)}</strong>
          </div>

          <div className="painel resumo-tabela">
            <div className="painel-cabecalho">
              <h2>Resumo financeiro</h2>
            </div>

            <div className="linha-resumo">
              <strong>Nº de diárias</strong>
              <span>{diarias}</span>
            </div>
            <div className="linha-resumo">
              <strong>Diária média</strong>
              <span>{formatarMoeda(valorDiaria)}</span>
            </div>
            <div className="linha-resumo">
              <strong>Diarias</strong>
              <span>{formatarMoeda(totalDiarias)}</span>
            </div>
            <div className="linha-resumo">
              <strong>Produtos</strong>
              <span>{formatarMoeda(0)}</span>
            </div>
            <div className="linha-resumo">
              <strong>Servicos</strong>
              <span>{formatarMoeda(0)}</span>
            </div>
            <div className="linha-resumo linha-total">
              <strong>Total</strong>
              <span>{formatarMoeda(total)}</span>
            </div>
            <div className="linha-resumo">
              <strong>Recebido</strong>
              <span>{formatarMoeda(recebido)}</span>
            </div>
          </div>

          <div className="painel atividades-reserva">
            <div className="painel-cabecalho">
              <h2>Atividades na reserva</h2>
            </div>
            {pagamentos.length === 0 && (
              <p>Nenhum pagamento lancado para esta reserva.</p>
            )}
            {pagamentos.map((pagamento) => (
              <div className="atividade-pagamento" key={pagamento.id}>
                <p>
                  {pagamento.forma || 'Forma pendente'} -{' '}
                  {formatarMoeda(pagamento.valor)}
                </p>
                {!camposBloqueados && (
                  <button
                    type="button"
                    className="botao-excluir botao-pequeno"
                    onClick={() => onExcluirPagamento(pagamento)}
                  >
                    Excluir
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  )
}

export default DetalhesReserva
