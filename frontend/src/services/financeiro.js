export const formasPagamento = [
  'Dinheiro',
  'Cartao de Credito',
  'Cartao de Debito',
  'Boleto Bancario',
  'Pix',
]

export const categoriasTransacao = ['Hospedagem', 'Produto', 'Servico']

export function calcularDiarias(dataEntrada, dataSaida) {
  if (!dataEntrada || !dataSaida) {
    return 0
  }

  const entrada = new Date(`${String(dataEntrada).slice(0, 10)}T00:00:00`)
  const saida = new Date(`${String(dataSaida).slice(0, 10)}T00:00:00`)
  const diferenca = saida.getTime() - entrada.getTime()
  const diarias = diferenca / (1000 * 60 * 60 * 24)

  return diarias > 0 ? diarias : 0
}

export function calcularTotalReserva(reserva) {
  const diarias = calcularDiarias(reserva?.data_entrada, reserva?.data_saida)
  const valorDiaria = Number(reserva?.valor_diaria || 0)

  return diarias * valorDiaria
}

export function formatarCodigoReserva(idReserva) {
  return `HO:${String(idReserva).padStart(6, '0')}`
}

export function formatarData(data) {
  if (!data) {
    return '-'
  }

  return new Date(data).toLocaleDateString('pt-BR')
}

export function formatarDataCampo(data) {
  if (!data) {
    return new Date().toISOString().slice(0, 10)
  }

  return String(data).slice(0, 10)
}

export function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function criarPagamentoDaReserva(reserva, valor) {
  const hoje = formatarDataCampo()

  return {
    id_reserva: reserva.id_reserva,
    descricao: `${formatarCodigoReserva(reserva.id_reserva)} - Quarto ${
      reserva.numero_quarto
    } - ${reserva.nome_hospede}`,
    forma: '',
    conta: 'Conta padrao',
    categoria: 'Hospedagem',
    emissao: hoje,
    vencimento: hoje,
    valor: Number(valor || 0).toFixed(2),
    concluido: true,
  }
}
