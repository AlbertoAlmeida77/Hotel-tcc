function FormularioQuarto({
  novoQuarto,
  salvandoQuarto,
  modo,
  onAtualizarCampo,
  onCadastrarQuarto,
  onCancelar,
}) {
  const estaEditando = modo === 'editar'

  return (
    <form className="formulario" onSubmit={onCadastrarQuarto}>
      <div className="painel-cabecalho">
        <div>
          <h2>{estaEditando ? 'Editar quarto' : 'Cadastrar quarto'}</h2>
          <span>
            {estaEditando
              ? 'Atualize os dados principais do quarto.'
              : 'Preencha os dados principais do quarto.'}
          </span>
        </div>
      </div>

      <div className="campos">
        <label>
          Numero
          <input
            name="numero"
            value={novoQuarto.numero}
            onChange={onAtualizarCampo}
            placeholder="Ex: 101"
            required
          />
        </label>

        <label>
          Tipo
          <input
            name="tipo"
            value={novoQuarto.tipo}
            onChange={onAtualizarCampo}
            placeholder="Ex: Solteiro, Casal, Suite"
            required
          />
        </label>

        <label>
          Capacidade
          <input
            name="capacidade"
            type="number"
            min="1"
            value={novoQuarto.capacidade}
            onChange={onAtualizarCampo}
            placeholder="Ex: 2"
            required
          />
        </label>

        <label>
          Valor da diaria
          <input
            name="valor_diaria"
            type="number"
            min="0"
            step="0.01"
            value={novoQuarto.valor_diaria}
            onChange={onAtualizarCampo}
            placeholder="Ex: 180.00"
            required
          />
        </label>

        <label>
          Status
          <select
            name="status"
            value={novoQuarto.status}
            onChange={onAtualizarCampo}
            required
            >
              <option value="Disponivel">Disponivel</option>
              <option value="Ocupado">Ocupado</option>
              <option value="Em limpeza">Em limpeza</option>
              <option value="Bloqueado">Bloqueado</option>
            </select>
          </label>

        <label className="campo-largo">
          Descricao
          <textarea
            name="descricao"
            value={novoQuarto.descricao}
            onChange={onAtualizarCampo}
            placeholder="Ex: Quarto com ar-condicionado e varanda"
            rows="3"
          />
        </label>
      </div>

      <div className="acoes-formulario acoes-com-espaco">
        {estaEditando && (
          <button
            type="button"
            className="botao-secundario"
            onClick={onCancelar}
          >
            Cancelar
          </button>
        )}
        <button type="submit" disabled={salvandoQuarto}>
          {salvandoQuarto
            ? 'Salvando...'
            : estaEditando
              ? 'Salvar alteracoes'
              : 'Cadastrar quarto'}
        </button>
      </div>
    </form>
  )
}

export default FormularioQuarto
