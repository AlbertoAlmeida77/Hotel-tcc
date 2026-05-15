import {
  categoriasTransacao,
  formasPagamento,
  formatarData,
  formatarMoeda,
} from '../services/financeiro'

function ModalFaturamentoAvulso({
  faturamento,
  quartos,
  onAtualizarCampo,
  onAlternarQuarto,
  onFechar,
  onSalvar,
}) {
  const quartosSelecionados = quartos.filter((quarto) =>
    faturamento.quartosSelecionados.includes(String(quarto.id_quarto)),
  )
  const valorSomadoQuartos = quartosSelecionados.reduce(
    (total, quarto) =>
      total + Number(quarto.valor_diaria || 0) * Number(faturamento.diarias || 0),
    0,
  )

  return (
    <div className="modal-fundo" role="presentation">
      <form className="modal-pagamento" onSubmit={onSalvar}>
        <div className="modal-cabecalho">
          <div>
            <h2>Novo faturamento</h2>
            <span>Sem vinculo com reserva</span>
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
              placeholder="Ex: cliente, empresa, convenio ou responsavel"
            />
          </label>

          <div className="modal-grade">
            <label>
              Entrada
              <input
                type="date"
                name="dataEntrada"
                value={faturamento.dataEntrada}
                onChange={onAtualizarCampo}
              />
            </label>

            <label>
              Saida
              <input
                type="date"
                name="dataSaida"
                value={faturamento.dataSaida}
                onChange={onAtualizarCampo}
              />
            </label>
          </div>

          <section className="faturamento-lote-resumo">
            <div className="orcamento-secao-topo">
              <h3>Quartos</h3>
              <span>{quartosSelecionados.length} selecionado(s)</span>
            </div>

            <div className="lista-quartos-orcamento">
              {quartos.length === 0 && (
                <p className="vazio">Nenhum quarto cadastrado para faturar.</p>
              )}

              {quartos.map((quarto) => {
                const selecionado = faturamento.quartosSelecionados.includes(
                  String(quarto.id_quarto),
                )

                return (
                  <label
                    className="linha-quarto-orcamento"
                    key={quarto.id_quarto}
                  >
                    <input
                      type="checkbox"
                      checked={selecionado}
                      onChange={() => onAlternarQuarto(quarto.id_quarto)}
                    />
                    <span>
                      <strong>Quarto {quarto.numero}</strong>
                      <small>{quarto.tipo || 'Tipo nao informado'}</small>
                    </span>
                    <b>{formatarMoeda(quarto.valor_diaria)}</b>
                  </label>
                )
              })}
            </div>
          </section>

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

            <label>
              * Valor
              <input
                type="number"
                name="valor"
                min="0.01"
                step="0.01"
                value={faturamento.valor}
                onChange={onAtualizarCampo}
                readOnly={quartosSelecionados.length > 0}
                required
              />
            </label>
          </div>

          {quartosSelecionados.length > 0 && (
            <section className="faturamento-lote-resumo">
              <div className="orcamento-secao-topo">
                <h3>Resumo</h3>
                <span>{Number(faturamento.diarias || 0)} diaria(s)</span>
              </div>

              <div className="faturamento-lote-lista">
                {quartosSelecionados.map((quarto) => (
                  <div
                    className="faturamento-lote-item"
                    key={quarto.id_quarto}
                  >
                    <span>
                      <strong>Quarto {quarto.numero}</strong>
                      <small>
                        {formatarData(faturamento.dataEntrada)} ate{' '}
                        {formatarData(faturamento.dataSaida)}
                      </small>
                    </span>
                    <b>
                      {formatarMoeda(
                        Number(quarto.valor_diaria || 0) *
                          Number(faturamento.diarias || 0),
                      )}
                    </b>
                  </div>
                ))}
              </div>
            </section>
          )}

          <label className="switch-linha">
            <input
              type="checkbox"
              name="concluido"
              checked={faturamento.concluido}
              onChange={onAtualizarCampo}
            />
            Marcar como recebido?
          </label>
        </div>

        <div className="modal-rodape">
          <span>
            Total:{' '}
            {formatarMoeda(
              quartosSelecionados.length > 0
                ? valorSomadoQuartos
                : faturamento.valor,
            )}
          </span>
          <button type="submit">Gerar faturamento</button>
        </div>
      </form>
    </div>
  )
}

export default ModalFaturamentoAvulso
