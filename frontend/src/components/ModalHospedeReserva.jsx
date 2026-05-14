function ModalHospedeReserva({
  hospede,
  salvando,
  onAtualizarCampo,
  onFechar,
  onSalvar,
}) {
  return (
    <div className="modal-fundo" role="presentation">
      <form className="modal-hospede" onSubmit={onSalvar}>
        <div className="modal-cabecalho">
          <h2>Novo hospede</h2>
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
            * Nome completo
            <input
              name="nome"
              value={hospede.nome}
              onChange={onAtualizarCampo}
              required
            />
          </label>

          <label className="campo-largo">
            * E-mail
            <input
              type="email"
              name="email"
              value={hospede.email}
              onChange={onAtualizarCampo}
              required
            />
          </label>

          <div className="modal-grade">
            <label>
              * Telefone
              <input
                name="telefone"
                value={hospede.telefone}
                onChange={onAtualizarCampo}
                placeholder="(00) 00000-0000"
                required
              />
            </label>

            <label>
              * CPF
              <input
                name="cpf"
                value={hospede.cpf}
                onChange={onAtualizarCampo}
                placeholder="000.000.000-00"
                required
              />
            </label>
          </div>

          <label className="campo-largo">
            Endereco
            <input
              name="endereco"
              value={hospede.endereco}
              onChange={onAtualizarCampo}
              placeholder="Rua, numero, bairro e cidade"
            />
          </label>

          <label className="campo-largo">
            Observacoes
            <textarea
              name="observacoes"
              value={hospede.observacoes}
              onChange={onAtualizarCampo}
              rows="3"
            />
          </label>
        </div>

        <div className="modal-rodape">
          <button
            type="button"
            className="botao-secundario"
            onClick={onFechar}
          >
            Cancelar
          </button>
          <button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Adicionar hospede'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ModalHospedeReserva
