function FormularioHospede({
  novoHospede,
  salvandoHospede,
  modo = 'cadastrar',
  onAtualizarCampo,
  onCadastrarHospede,
  onCancelar,
}) {
  const editando = modo === 'editar'

  return (
    <form className="formulario" onSubmit={onCadastrarHospede}>
      <div className="painel-cabecalho">
        <div>
          <h2>{editando ? 'Editar hospede' : 'Cadastrar hospede'}</h2>
          <span>
            {editando
              ? 'Atualize os dados principais do hospede.'
              : 'Preencha os dados principais do hospede.'}
          </span>
        </div>
      </div>

      <div className="campos">
        <label>
          Nome completo
          <input
            name="nome"
            value={novoHospede.nome}
            onChange={onAtualizarCampo}
            placeholder="Nome do hospede"
            required
          />
        </label>

        <label>
          CPF
          <input
            name="cpf"
            value={novoHospede.cpf}
            onChange={onAtualizarCampo}
            placeholder="000.000.000-00"
            required
          />
        </label>

        <label>
          Telefone
          <input
            name="telefone"
            value={novoHospede.telefone}
            onChange={onAtualizarCampo}
            placeholder="(00) 00000-0000"
            required
          />
        </label>

        <label>
          E-mail
          <input
            name="email"
            type="email"
            value={novoHospede.email}
            onChange={onAtualizarCampo}
            placeholder="email@exemplo.com"
            required
          />
        </label>

        <label className="campo-largo">
          Endereco
          <input
            name="endereco"
            value={novoHospede.endereco}
            onChange={onAtualizarCampo}
            placeholder="Rua, numero, bairro e cidade"
          />
        </label>

        <label className="campo-largo">
          Observacoes
          <textarea
            name="observacoes"
            value={novoHospede.observacoes}
            onChange={onAtualizarCampo}
            placeholder="Informacoes adicionais"
            rows="3"
          />
        </label>
      </div>

      <div className="acoes-formulario acoes-com-espaco">
        <button type="button" className="botao-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" disabled={salvandoHospede}>
          {salvandoHospede
            ? 'Salvando...'
            : editando
              ? 'Salvar alteracoes'
              : 'Cadastrar hospede'}
        </button>
      </div>
    </form>
  )
}

export default FormularioHospede
