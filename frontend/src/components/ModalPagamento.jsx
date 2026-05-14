import {
  categoriasTransacao,
  formasPagamento,
  formatarCodigoReserva,
  formatarMoeda,
} from '../services/financeiro'

function ModalPagamento({
  reserva,
  pagamento,
  onAtualizarCampo,
  onFechar,
  onSalvar,
}) {
  return (
    <div className="modal-fundo" role="presentation">
      <form className="modal-pagamento" onSubmit={onSalvar}>
        <div className="modal-cabecalho">
          <h2>Novo pagamento</h2>
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
            * Descricao
            <input
              name="descricao"
              value={pagamento.descricao}
              onChange={onAtualizarCampo}
              required
            />
          </label>

          <div className="modal-grade">
            <label>
              * Forma
              <select
                name="forma"
                value={pagamento.forma}
                onChange={onAtualizarCampo}
                required
              >
                <option value="">» selecione uma forma «</option>
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
                value={pagamento.conta}
                onChange={onAtualizarCampo}
                required
              >
                <option value="Conta padrao">Conta padrao</option>
                <option value="Caixa">Caixa</option>
                <option value="Banco">Banco</option>
              </select>
            </label>

            <label>
              * Categoria
              <select
                name="categoria"
                value={pagamento.categoria}
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
                value={pagamento.emissao}
                onChange={onAtualizarCampo}
                required
              />
            </label>

            <label>
              * Vencimento
              <input
                type="date"
                name="vencimento"
                value={pagamento.vencimento}
                onChange={onAtualizarCampo}
                required
              />
            </label>

            <label>
              * Valor
              <input
                type="number"
                name="valor"
                min="0"
                step="0.01"
                value={pagamento.valor}
                onChange={onAtualizarCampo}
                required
              />
            </label>
          </div>

          <label className="switch-linha">
            <input
              type="checkbox"
              name="concluido"
              checked={pagamento.concluido}
              onChange={onAtualizarCampo}
            />
            Concluido?
          </label>

          <p className="falta-lancar">
            Falta lancar: {formatarMoeda(pagamento.valor)}
          </p>
        </div>

        <div className="modal-rodape">
          <span>
            {formatarCodigoReserva(reserva.id_reserva)} - Quarto{' '}
            {reserva.numero_quarto} - {reserva.nome_hospede}
          </span>
          <button type="submit">Adicionar pagamento</button>
        </div>
      </form>
    </div>
  )
}

export default ModalPagamento
