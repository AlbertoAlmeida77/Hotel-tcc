import { useEffect, useRef, useState } from 'react'

const situacoesReserva = [
  { valor: 'pre-reservar', texto: 'pre-reservar', cor: 'amarelo' },
  { valor: 'reservar', texto: 'reservar', cor: 'azul' },
  { valor: 'hospedar', texto: 'hospedar', cor: 'vermelho' },
  { valor: 'bloquear datas', texto: 'bloquear datas', cor: 'escuro' },
]

function DropdownHospede({ hospedes, value, onChange, onAbrirNovoHospede }) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const ref = useRef(null)
  const inputRef = useRef(null)

  const hospedeSelecionado = hospedes.find(
    (h) => String(h.id_hospede) === String(value),
  )

  const hospedesFiltrados = hospedes.filter((h) => {
    const termo = busca.toLowerCase()
    return (
      h.nome?.toLowerCase().includes(termo) ||
      h.cpf?.toLowerCase().includes(termo) ||
      h.telefone?.toLowerCase().includes(termo)
    )
  })

  function abrirDropdown() {
    setAberto(true)
    setBusca('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function fecharDropdown() {
    setAberto(false)
    setBusca('')
  }

  function selecionarHospede(hospede) {
    onChange({
      target: {
        name: 'id_hospede',
        value: String(hospede.id_hospede),
        type: 'select',
      },
    })
    fecharDropdown()
  }

  function limparSelecao(e) {
    e.stopPropagation()
    onChange({
      target: { name: 'id_hospede', value: '', type: 'select' },
    })
    fecharDropdown()
  }

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickFora(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        fecharDropdown()
      }
    }
    if (aberto) {
      document.addEventListener('mousedown', handleClickFora)
    }
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [aberto])

  // Atualiza quando o value muda externamente (ex: cadastro rápido)
  useEffect(() => {
    if (!value) setBusca('')
  }, [value])

  return (
    <div className="campo-com-acao">
      <label>
        Hospede
        {/* Campo oculto para validação HTML5 */}
        <input
          type="text"
          name="id_hospede"
          value={value}
          required
          readOnly
          tabIndex={-1}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
        <div
          ref={ref}
          className="hospede-dropdown-wrapper"
          style={{ position: 'relative' }}
        >
          {/* Trigger / campo de exibição */}
          <button
            type="button"
            className={`hospede-dropdown-trigger${aberto ? ' hospede-dropdown-trigger--aberto' : ''}`}
            onClick={aberto ? fecharDropdown : abrirDropdown}
            aria-haspopup="listbox"
            aria-expanded={aberto}
          >
            {hospedeSelecionado ? (
              <span className="hospede-dropdown-selecionado">
                <span className="hospede-dropdown-avatar">
                  {hospedeSelecionado.nome.charAt(0).toUpperCase()}
                </span>
                <span className="hospede-dropdown-info">
                  <strong>{hospedeSelecionado.nome}</strong>
                  <span>{hospedeSelecionado.cpf}</span>
                </span>
                <button
                  type="button"
                  className="hospede-dropdown-limpar"
                  onClick={limparSelecao}
                  aria-label="Remover hóspede selecionado"
                  title="Remover seleção"
                >
                  ×
                </button>
              </span>
            ) : (
              <span className="hospede-dropdown-placeholder">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                Selecione um hóspede
              </span>
            )}
            <svg
              className={`hospede-dropdown-chevron${aberto ? ' hospede-dropdown-chevron--aberto' : ''}`}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Painel de opções */}
          {aberto && (
            <div className="hospede-dropdown-painel" role="listbox">
              {/* Campo de busca */}
              <div className="hospede-dropdown-busca">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar por nome ou CPF..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="hospede-dropdown-input-busca"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Lista de resultados */}
              <ul className="hospede-dropdown-lista">
                {hospedesFiltrados.length === 0 ? (
                  <li className="hospede-dropdown-vazio">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    Nenhum hóspede encontrado
                  </li>
                ) : (
                  hospedesFiltrados.map((hospede) => {
                    const selecionado =
                      String(hospede.id_hospede) === String(value)
                    return (
                      <li
                        key={hospede.id_hospede}
                        role="option"
                        aria-selected={selecionado}
                        className={`hospede-dropdown-opcao${selecionado ? ' hospede-dropdown-opcao--selecionada' : ''}`}
                        onClick={() => selecionarHospede(hospede)}
                      >
                        <span className="hospede-dropdown-avatar hospede-dropdown-avatar--sm">
                          {hospede.nome.charAt(0).toUpperCase()}
                        </span>
                        <span className="hospede-dropdown-opcao-info">
                          <strong>{hospede.nome}</strong>
                          <span>{hospede.cpf}{hospede.telefone ? ` · ${hospede.telefone}` : ''}</span>
                        </span>
                        {selecionado && (
                          <svg
                            className="hospede-dropdown-check"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </li>
                    )
                  })
                )}
              </ul>
            </div>
          )}
        </div>
      </label>

      {/* Botão + para adicionar novo hóspede */}
      <button
        type="button"
        className="botao-icone botao-adicionar-hospede"
        title="Cadastrar novo hóspede rapidamente"
        aria-label="Adicionar novo hospede"
        onClick={onAbrirNovoHospede}
      >
        +
      </button>
    </div>
  )
}

function FormularioReserva({
  reserva,
  quartos,
  hospedes,
  salvandoReserva,
  onAtualizarCampo,
  onAdicionarReserva,
  onAbrirNovoHospede,
  onCancelar,
}) {
  return (
    <div className="layout-reserva-criacao">
      <form
        className="formulario reserva-formulario"
        onSubmit={onAdicionarReserva}
      >
        <div className="painel-cabecalho">
          <div>
            <h2>Nova reserva</h2>
            <span>Informe os dados principais da hospedagem.</span>
          </div>
        </div>

        <div className="grupo-formulario">
          <label className="campo-situacao">
            Situacao
            <div className="opcoes-situacao">
              {situacoesReserva.map((situacao) => (
                <label className="opcao-situacao" key={situacao.valor}>
                  <input
                    type="radio"
                    name="situacao"
                    value={situacao.valor}
                    checked={reserva.situacao === situacao.valor}
                    onChange={onAtualizarCampo}
                  />
                  <span className={`pill-situacao pill-${situacao.cor}`}>
                    {situacao.texto}
                  </span>
                </label>
              ))}
            </div>
          </label>
        </div>

        <div className="grupo-formulario">
          <div className="campos reserva-campos">
            <DropdownHospede
              hospedes={hospedes}
              value={reserva.id_hospede}
              onChange={onAtualizarCampo}
              onAbrirNovoHospede={onAbrirNovoHospede}
            />

            <label>
              Quarto
              <select
                name="id_quarto"
                value={reserva.id_quarto}
                onChange={onAtualizarCampo}
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
                value={reserva.data_entrada}
                onChange={onAtualizarCampo}
                required
              />
            </label>

            <label>
              Saida
              <input
                type="date"
                name="data_saida"
                value={reserva.data_saida}
                onChange={onAtualizarCampo}
                required
              />
            </label>

            <label>
              Valor da diaria
              <input
                type="number"
                name="valor_diaria"
                min="0"
                step="0.01"
                value={reserva.valor_diaria}
                onChange={onAtualizarCampo}
                placeholder="0.00"
                required
              />
            </label>

            <label>
              Adultos
              <input
                type="number"
                name="adultos"
                min="1"
                value={reserva.adultos}
                onChange={onAtualizarCampo}
                required
              />
            </label>

            <label>
              Criancas
              <input
                type="number"
                name="criancas"
                min="0"
                value={reserva.criancas}
                onChange={onAtualizarCampo}
              />
            </label>

            <label className="campo-largo">
              Observacao
              <textarea
                name="observacao"
                value={reserva.observacao}
                onChange={onAtualizarCampo}
                rows="4"
                placeholder="Observacoes da reserva"
              />
            </label>
          </div>
        </div>

        <div className="acoes-formulario acoes-com-espaco">
          <button type="button" className="botao-secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" disabled={salvandoReserva}>
            {salvandoReserva ? 'Salvando...' : 'Confirmar reserva'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioReserva
