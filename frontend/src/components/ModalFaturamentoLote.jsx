import {
  categoriasTransacao,
  formasPagamento,
  formatarCodigoReserva,
  formatarMoeda,
} from '../services/financeiro'

function ModalFaturamentoLote({
  faturamento,
  reservas,
  totalPendente,
  onAtualizarCampo,
  onFechar,
  onSalvar,
}) {
  return (
    <div className="modal-fundo" role="presentation">
      <form className="modal-pagamento modal-faturamento-lote" onSubmit={onSalvar}>
        <div className="modal-cabecalho">
          <div>
            <h2>Faturar reservas</h2>
            <span>{reservas.length} reserva(s) selecionada(s)</span>
          </div>
          <button
            type="button"
            className="botao-icone"
            aria-label="Fechar"
            onClick={onFechar}
          >
            x
          </button>
        </div>

        <div className="modal-corpo">
          <label className="campo-largo">
            Faturar para
            <input
              name="faturarPara"
              value={faturamento.faturarPara}
              onChange={onAtualizarCampo}
              placeholder="Ex: empresa, convenio, responsavel ou cliente"
            />
          </label>

          <label className="campo-largo">
            * Descricao
            <input
              name="descricao"
              value={faturamento.descricao}
              onChange={onAtualizarCampo}
              required
            />
          </label>

          <div className="modal-grade">
            <label>
              * Forma
              <select
                name="forma"
                value={faturamento.forma}
                onChange={onAtualizarCampo}
                required
              >
                <option value="">selecione uma forma</option>
                {formasPagamento.map((forma) => (
                  <option value={forma} key={forma}>
                    {forma}
                  </option>
                ))}
              </select>
            </label>

            <label>
              * Conta
              <select
                name="conta"
                value={faturamento.conta}
                onChange={onAtualizarCampo}
                required
              >
                <option value="Conta padrao">Caixa Dinheiro</option>
                <option value="Caixa">Conta Digital</option>
              </select>
            </label>

            <label>
              * Categoria
              <select
                name="categoria"
                value={faturamento.categoria}
                onChange={onAtualizarCampo}
                required
              >
                {categoriasTransacao.map((categoria) => (
                  <option value={categoria} key={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </label>

            <label>
              * Emissao
              <input
                type="date"
                name="emissao"
                value={faturamento.emissao}
                onChange={onAtualizarCampo}
                required
              />
            </label>

            <label>
              * Vencimento
              <input
                type="date"
                name="vencimento"
                value={faturamento.vencimento}
                onChange={onAtualizarCampo}
                required
              />
            </label>
          </div>

          <label className="switch-linha">
            <input
              type="checkbox"
              name="concluido"
              checked={faturamento.concluido}
              onChange={onAtualizarCampo}
            />
            Marcar como recebido?
          </label>

          <section className="faturamento-lote-resumo">
            <div className="orcamento-secao-topo">
              <h3>Reservas no faturamento</h3>
              <span>{formatarMoeda(totalPendente)}</span>
            </div>

            <div className="faturamento-lote-lista">
              {reservas.map((reserva) => (
                <div
                  className="faturamento-lote-item"
                  key={reserva.id_reserva}
                >
                  <span>
                    <strong>{formatarCodigoReserva(reserva.id_reserva)}</strong>
                    <small>
                      Quarto {reserva.numero_quarto || '-'} -{' '}
                      {reserva.nome_hospede || 'Hospede nao informado'}
                    </small>
                  </span>
                  <b>{formatarMoeda(reserva.valor_pendente)}</b>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="modal-rodape">
          <span>Total a faturar: {formatarMoeda(totalPendente)}</span>
          <button type="submit" disabled={totalPendente <= 0}>
            Gerar faturamento
          </button>
        </div>
      </form>
    </div>
  )
}

export default ModalFaturamentoLote
