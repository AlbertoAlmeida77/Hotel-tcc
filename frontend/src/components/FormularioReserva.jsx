const situacoesReserva = [
  { valor: 'pre-reservar', texto: 'pre-reservar', cor: 'amarelo' },
  { valor: 'reservar', texto: 'reservar', cor: 'azul' },
  { valor: 'hospedar', texto: 'hospedar', cor: 'vermelho' },
  { valor: 'bloquear datas', texto: 'bloquear datas', cor: 'escuro' },
]

function FormularioReserva({
  reserva,
  quartos,
  hospedes,
  salvandoReserva,
  onAtualizarCampo,
  onAdicionarReserva,
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
            <label>
              Hospede
              <select
                name="id_hospede"
                value={reserva.id_hospede}
                onChange={onAtualizarCampo}
                required
              >
                <option value="">Selecione um hospede</option>
                {hospedes.map((hospede) => (
                  <option value={hospede.id_hospede} key={hospede.id_hospede}>
                    {hospede.nome} - {hospede.cpf}
                  </option>
                ))}
              </select>
            </label>

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

            <label className="switch-campo">
              Cafe da manha
              <input
                type="checkbox"
                name="cafe_manha"
                checked={reserva.cafe_manha}
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
