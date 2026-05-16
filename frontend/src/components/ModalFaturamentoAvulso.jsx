import { useMemo, useState } from 'react'
import {
  calcularDiarias,
  formasPagamento,
  formatarData,
  formatarDataCampo,
  formatarMoeda,
} from '../services/financeiro'

const itemVazio = {
  id_quarto: '',
  tipo_quarto: '',
  data_entrada: '',
  data_saida: '',
  quantidade_diarias: 0,
  valor_diaria: '',
  adultos: '1',
  criancas: '0',
  observacao: '',
}

function IconeFaturamento({ tipo }) {
  const icones = {
    adicionar: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    editar: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </>
    ),
    remover: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6 18 20H6L5 6" />
      </>
    ),
    limpar: (
      <>
        <path d="M3 6h18" />
        <path d="M8 12h8" />
        <path d="M10 18h4" />
      </>
    ),
    fechar: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {icones[tipo]}
    </svg>
  )
}

function calcularSubtotalItem(item) {
  return Number(item.quantidade_diarias || 0) * Number(item.valor_diaria || 0)
}

function prepararItemComDatas(item) {
  return {
    ...item,
    quantidade_diarias: calcularDiarias(item.data_entrada, item.data_saida),
  }
}

function ModalFaturamentoAvulso({
  faturamento,
  hospedes,
  quartos,
  onFechar,
  onSalvar,
}) {
  const [idHospedeSelecionado, setIdHospedeSelecionado] = useState('')
  const [itemAtual, setItemAtual] = useState(itemVazio)
  const [itensCarrinho, setItensCarrinho] = useState([])
  const [indiceEdicao, setIndiceEdicao] = useState(null)
  const [desconto, setDesconto] = useState('0')
  const [forma, setForma] = useState(faturamento.forma || '')
  const [conta, setConta] = useState(faturamento.conta || 'Conta padrao')
  const [emissao, setEmissao] = useState(
    faturamento.emissao || formatarDataCampo(),
  )
  const [vencimento, setVencimento] = useState(
    faturamento.vencimento || formatarDataCampo(),
  )
  const [concluido, setConcluido] = useState(
    faturamento.concluido !== undefined ? faturamento.concluido : true,
  )
  const [erroFormulario, setErroFormulario] = useState('')

  const hospedeSelecionado = hospedes.find(
    (hospede) => String(hospede.id_hospede) === String(idHospedeSelecionado),
  )
  const quartoSelecionado = quartos.find(
    (quarto) => String(quarto.id_quarto) === String(itemAtual.id_quarto),
  )
  const subtotalGeral = itensCarrinho.reduce(
    (total, item) => total + calcularSubtotalItem(item),
    0,
  )
  const totalDiarias = itensCarrinho.reduce(
    (total, item) => total + Number(item.quantidade_diarias || 0),
    0,
  )
  const descontoNumerico = Math.max(Number(desconto || 0), 0)
  const totalFinal = Math.max(subtotalGeral - descontoNumerico, 0)
  const itemAtualSubtotal = calcularSubtotalItem(itemAtual)
  const podeFinalizar =
    Boolean(hospedeSelecionado) &&
    itensCarrinho.length > 0 &&
    forma &&
    conta &&
    emissao &&
    vencimento
  const payloadPreview = useMemo(
    () => ({
      id_hospede: hospedeSelecionado?.id_hospede || null,
      itens: itensCarrinho.map((item) => ({
        id_quarto: item.id_quarto,
        data_entrada: item.data_entrada,
        data_saida: item.data_saida,
        quantidade_diarias: item.quantidade_diarias,
        valor_diaria: Number(item.valor_diaria || 0),
        adultos: Number(item.adultos || 1),
        criancas: Number(item.criancas || 0),
        observacao: item.observacao,
        subtotal: calcularSubtotalItem(item),
      })),
      subtotal_geral: subtotalGeral,
      desconto: descontoNumerico,
      total_final: totalFinal,
    }),
    [descontoNumerico, hospedeSelecionado, itensCarrinho, subtotalGeral, totalFinal],
  )

  function atualizarItem(evento) {
    const { name, value } = evento.target

    setItemAtual((item) => {
      if (name === 'id_quarto') {
        const quarto = quartos.find(
          (quartoAtual) => String(quartoAtual.id_quarto) === String(value),
        )

        return prepararItemComDatas({
          ...item,
          id_quarto: value,
          tipo_quarto: quarto?.tipo || '',
          valor_diaria: quarto?.valor_diaria || '',
        })
      }

      return prepararItemComDatas({
        ...item,
        [name]: value,
      })
    })
  }

  function limparCamposItem() {
    setItemAtual(itemVazio)
    setIndiceEdicao(null)
    setErroFormulario('')
  }

  function validarItem() {
    if (!itemAtual.id_quarto) {
      return 'Selecione um quarto para adicionar ao faturamento.'
    }

    if (!itemAtual.data_entrada || !itemAtual.data_saida) {
      return 'Informe a data de entrada e a data de saida.'
    }

    if (Number(itemAtual.quantidade_diarias || 0) <= 0) {
      return 'A data de saida deve ser maior que a data de entrada.'
    }

    if (Number(itemAtual.valor_diaria || 0) <= 0) {
      return 'Informe um valor de diaria maior que zero.'
    }

    return ''
  }

  function adicionarItem() {
    const mensagemErro = validarItem()

    if (mensagemErro) {
      setErroFormulario(mensagemErro)
      return
    }

    const proximoItem = {
      ...itemAtual,
      id: itemAtual.id || crypto.randomUUID(),
      numero_quarto: quartoSelecionado?.numero || '',
      nome_quarto: `Quarto ${quartoSelecionado?.numero || '-'}`,
      tipo_quarto: itemAtual.tipo_quarto || quartoSelecionado?.tipo || '',
      quantidade_diarias: Number(itemAtual.quantidade_diarias || 0),
      valor_diaria: Number(itemAtual.valor_diaria || 0),
      adultos: Number(itemAtual.adultos || 1),
      criancas: Number(itemAtual.criancas || 0),
      subtotal: itemAtualSubtotal,
    }

    setItensCarrinho((itens) => {
      if (indiceEdicao === null) {
        return [proximoItem, ...itens]
      }

      return itens.map((item, indice) =>
        indice === indiceEdicao ? proximoItem : item,
      )
    })
    limparCamposItem()
  }

  function editarItem(indice) {
    const item = itensCarrinho[indice]

    setItemAtual({
      ...item,
      id_quarto: String(item.id_quarto),
      valor_diaria: String(item.valor_diaria),
      adultos: String(item.adultos),
      criancas: String(item.criancas),
    })
    setIndiceEdicao(indice)
    setErroFormulario('')
  }

  function removerItem(indice) {
    setItensCarrinho((itens) => itens.filter((_, indiceAtual) => indiceAtual !== indice))

    if (indiceEdicao === indice) {
      limparCamposItem()
    }
  }

  function finalizarFaturamento(evento) {
    evento.preventDefault()

    if (!hospedeSelecionado) {
      setErroFormulario('Selecione um hospede para finalizar o faturamento.')
      return
    }

    if (itensCarrinho.length === 0) {
      setErroFormulario('Adicione pelo menos um quarto ao faturamento.')
      return
    }

    onSalvar({
      ...payloadPreview,
      faturarPara: hospedeSelecionado.nome,
      forma,
      conta,
      emissao,
      vencimento,
      categoria: 'Avulso',
      concluido,
      descricao: `Novo faturamento - ${hospedeSelecionado.nome}`,
      hospede: hospedeSelecionado,
      itensCarrinho,
    })
  }

  return (
    <div className="modal-fundo" role="presentation">
      <form
        className="modal-pagamento modal-novo-faturamento"
        onSubmit={finalizarFaturamento}
      >
        <div className="modal-cabecalho">
          <div>
            <h2>Novo Faturamento</h2>
            <span>Monte o faturamento como um carrinho antes de finalizar.</span>
          </div>
          <button
            type="button"
            className="botao-icone"
            aria-label="Fechar"
            onClick={onFechar}
          >
            <IconeFaturamento tipo="fechar" />
          </button>
        </div>

        <div className="novo-faturamento-corpo">
          <section className="faturamento-card faturamento-hospede">
            <label>
              Buscar ou selecionar hospede
              <select
                value={idHospedeSelecionado}
                onChange={(evento) => setIdHospedeSelecionado(evento.target.value)}
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

            {hospedeSelecionado ? (
              <div className="hospede-faturamento-selecionado">
                <strong>{hospedeSelecionado.nome}</strong>
                <span>{hospedeSelecionado.telefone || 'Telefone nao informado'}</span>
                <span>
                  {hospedeSelecionado.cpf ||
                    hospedeSelecionado.documento ||
                    'Documento nao informado'}
                </span>
              </div>
            ) : (
              <p className="faturamento-ajuda">
                Selecione um hospede para habilitar a finalizacao.
              </p>
            )}
          </section>

          <div className="novo-faturamento-layout">
            <section className="faturamento-card faturamento-formulario-item">
              <div className="faturamento-card-topo">
                <div>
                  <h3>Adicionar quarto</h3>
                  <span>Preencha os dados da hospedagem.</span>
                </div>
                <b>{formatarMoeda(itemAtualSubtotal)}</b>
              </div>

              {erroFormulario && <p className="aviso erro">{erroFormulario}</p>}

              <div className="faturamento-grade">
                <label>
                  Quarto
                  <select
                    name="id_quarto"
                    value={itemAtual.id_quarto}
                    onChange={atualizarItem}
                  >
                    <option value="">Selecione</option>
                    {quartos.map((quarto) => (
                      <option value={quarto.id_quarto} key={quarto.id_quarto}>
                        Quarto {quarto.numero}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Tipo do quarto
                  <input
                    name="tipo_quarto"
                    value={itemAtual.tipo_quarto}
                    onChange={atualizarItem}
                    placeholder="Tipo"
                  />
                </label>

                <label>
                  Entrada
                  <input
                    type="date"
                    name="data_entrada"
                    value={itemAtual.data_entrada}
                    onChange={atualizarItem}
                  />
                </label>

                <label>
                  Saida
                  <input
                    type="date"
                    name="data_saida"
                    value={itemAtual.data_saida}
                    onChange={atualizarItem}
                  />
                </label>

                <label>
                  Valor da diaria
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="valor_diaria"
                    value={itemAtual.valor_diaria}
                    onChange={atualizarItem}
                  />
                </label>

                <label>
                  Adultos
                  <input
                    type="number"
                    min="1"
                    name="adultos"
                    value={itemAtual.adultos}
                    onChange={atualizarItem}
                  />
                </label>

                <label>
                  Criancas
                  <input
                    type="number"
                    min="0"
                    name="criancas"
                    value={itemAtual.criancas}
                    onChange={atualizarItem}
                  />
                </label>

                <label className="campo-largo">
                  Observacao
                  <textarea
                    name="observacao"
                    value={itemAtual.observacao}
                    onChange={atualizarItem}
                    rows="3"
                    placeholder="Ex: hospedagem casal"
                  />
                </label>
              </div>

              <div className="faturamento-acoes-item">
                <button type="button" onClick={adicionarItem}>
                  <IconeFaturamento tipo="adicionar" />
                  {indiceEdicao === null ? 'Adicionar ao faturamento' : 'Salvar item'}
                </button>
                <button
                  type="button"
                  className="botao-secundario"
                  onClick={limparCamposItem}
                >
                  <IconeFaturamento tipo="limpar" />
                  Limpar campos
                </button>
              </div>
            </section>

            <aside className="faturamento-card faturamento-carrinho">
              <div className="faturamento-card-topo">
                <div>
                  <h3>Resumo do faturamento</h3>
                  <span>{itensCarrinho.length} quarto(s) adicionados</span>
                </div>
                <strong>{formatarMoeda(totalFinal)}</strong>
              </div>

              <div className="carrinho-itens">
                {itensCarrinho.length === 0 && (
                  <p className="faturamento-ajuda">
                    Nenhum quarto adicionado ao faturamento.
                  </p>
                )}

                {itensCarrinho.map((item, indice) => (
                  <article className="carrinho-item" key={item.id}>
                    <div>
                      <strong>
                        {item.nome_quarto} - {item.tipo_quarto || 'Tipo nao informado'}
                      </strong>
                      <span>
                        Entrada: {formatarData(item.data_entrada)} | Saida:{' '}
                        {formatarData(item.data_saida)}
                      </span>
                      <span>
                        Diarias: {item.quantidade_diarias} | Valor diaria:{' '}
                        {formatarMoeda(item.valor_diaria)}
                      </span>
                    </div>
                    <b>{formatarMoeda(item.subtotal)}</b>
                    <div className="carrinho-item-acoes">
                      <button
                        type="button"
                        className="botao-icone"
                        aria-label="Editar item"
                        onClick={() => editarItem(indice)}
                      >
                        <IconeFaturamento tipo="editar" />
                      </button>
                      <button
                        type="button"
                        className="botao-icone botao-remover-carrinho"
                        aria-label="Remover item"
                        onClick={() => removerItem(indice)}
                      >
                        <IconeFaturamento tipo="remover" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="faturamento-totalizacao">
                <div>
                  <span>Quartos</span>
                  <strong>{itensCarrinho.length}</strong>
                </div>
                <div>
                  <span>Total de diarias</span>
                  <strong>{totalDiarias}</strong>
                </div>
                <div>
                  <span>Subtotal</span>
                  <strong>{formatarMoeda(subtotalGeral)}</strong>
                </div>
                <label>
                  Desconto
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={desconto}
                    onChange={(evento) => setDesconto(evento.target.value)}
                  />
                </label>
                <div className="faturamento-total-final">
                  <span>Total final</span>
                  <strong>{formatarMoeda(totalFinal)}</strong>
                </div>
              </div>

              <div className="faturamento-grade faturamento-dados-pagamento">
                <label>
                  Forma
                  <select
                    value={forma}
                    onChange={(evento) => setForma(evento.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    {formasPagamento.map((formaPagamento) => (
                      <option value={formaPagamento} key={formaPagamento}>
                        {formaPagamento}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Conta
                  <select
                    value={conta}
                    onChange={(evento) => setConta(evento.target.value)}
                    required
                  >
                    <option value="Conta padrao">Caixa Dinheiro</option>
                    <option value="Caixa">Conta Digital</option>
                  </select>
                </label>

                <label>
                  Emissao
                  <input
                    type="date"
                    value={emissao}
                    onChange={(evento) => setEmissao(evento.target.value)}
                    required
                  />
                </label>

                <label>
                  Vencimento
                  <input
                    type="date"
                    value={vencimento}
                    onChange={(evento) => setVencimento(evento.target.value)}
                    required
                  />
                </label>

                <label className="switch-linha faturamento-switch campo-largo">
                  <input
                    type="checkbox"
                    checked={concluido}
                    onChange={(evento) => setConcluido(evento.target.checked)}
                  />
                  Marcar como recebido
                </label>
              </div>

            </aside>
          </div>
        </div>

        <div className="modal-rodape">
          <button type="button" className="botao-secundario" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" disabled={!podeFinalizar}>
            Finalizar faturamento
          </button>
        </div>
      </form>
    </div>
  )
}

export default ModalFaturamentoAvulso
