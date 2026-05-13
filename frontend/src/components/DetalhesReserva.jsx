function calcularDiarias(dataEntrada, dataSaida) {
  if (!dataEntrada || !dataSaida) {
    return 0
  }

  const entrada = new Date(`${dataEntrada}T00:00:00`)
  const saida = new Date(`${dataSaida}T00:00:00`)
  const diferenca = saida.getTime() - entrada.getTime()
  const diarias = diferenca / (1000 * 60 * 60 * 24)

  return diarias > 0 ? diarias : 0
}

function formatarCodigo(idReserva) {
  return `HO:${String(idReserva).padStart(6, '0')}`
}

function formatarData(data) {
  if (!data) {
    return '-'
  }

  return new Date(data).toLocaleDateString('pt-BR')
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function DetalhesReserva({ reserva, onCancelar, onHospedar, onVoltar }) {
  const diarias = calcularDiarias(reserva.data_entrada, reserva.data_saida)
  const valorDiaria = Number(reserva.valor_diaria || 0)
  const totalDiarias = diarias * valorDiaria
  const total = totalDiarias
  const recebido = 0
  const faltaLancar = total - recebido

  return (
    <>
      <div className="barra-acoes">
        <button type="button" className="botao-secundario" onClick={onVoltar}>
          Voltar para reservas
        </button>
      </div>

      <div className="layout-reserva">
        <section className="formulario reserva-formulario">
          <div className="painel-cabecalho">
            <div>
              <h2>Reserva {formatarCodigo(reserva.id_reserva)}</h2>
              <span>Dados da reserva e hospedagem.</span>
            </div>
            <span className="pill-situacao pill-amarelo">
              {reserva.situacao}
            </span>
          </div>

          <div className="dados-reserva">
            <p>
              <strong>Hospede:</strong> {reserva.nome_hospede}
            </p>
            <p>
              <strong>Quarto:</strong> Quarto {reserva.numero_quarto}
            </p>
            <p>
              <strong>Periodo:</strong> {formatarData(reserva.data_entrada)} ate{' '}
              {formatarData(reserva.data_saida)}
            </p>
            <p>
              <strong>Valor da diaria:</strong>{' '}
              {formatarMoeda(reserva.valor_diaria)}
            </p>
            <p>
              <strong>Adultos:</strong> {reserva.adultos}
            </p>
            <p>
              <strong>Criancas:</strong> {reserva.criancas}
            </p>
            <p>
              <strong>Cafe da manha:</strong>{' '}
              {reserva.cafe_manha ? 'Sim' : 'Nao'}
            </p>
            <p>
              <strong>Observacao:</strong>{' '}
              {reserva.observacao || 'Nenhuma observacao'}
            </p>
          </div>

          <div className="acoes-formulario acoes-com-espaco">
            <button
              type="button"
              className="botao-hospedar-reserva"
              onClick={onHospedar}
            >
              Hospedar
            </button>
            <button type="button" className="botao-cancelar" onClick={onCancelar}>
              Cancelar
            </button>
          </div>
        </section>

        <aside className="resumo-reserva">
          <div className="painel resumo-destaque">
            <span>Falta lancar</span>
            <strong>{formatarMoeda(faltaLancar)}</strong>
          </div>

          <div className="painel resumo-tabela">
            <div className="painel-cabecalho">
              <h2>Resumo</h2>
              <span>-</span>
            </div>

            <div className="linha-resumo">
              <strong>No diarias</strong>
              <span>{diarias}</span>
            </div>
            <div className="linha-resumo">
              <strong>Diaria media</strong>
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
              <span>+</span>
            </div>
            <p>Reserva criada no frontend. Pagamentos entram no proximo passo.</p>
          </div>
        </aside>
      </div>
    </>
  )
}

export default DetalhesReserva
