const API_URL = 'http://localhost:3000'

export async function buscarDadosDoServidor() {
  const [respostaQuartos, respostaHospedes, respostaReservas] = await Promise.all([
    fetch(`${API_URL}/quartos`),
    fetch(`${API_URL}/hospedes`),
    fetch(`${API_URL}/reservas`),
  ])

  if (!respostaQuartos.ok || !respostaHospedes.ok || !respostaReservas.ok) {
    throw new Error('Nao foi possivel buscar os dados do servidor.')
  }

  const dadosQuartos = await respostaQuartos.json()
  const dadosHospedes = await respostaHospedes.json()
  const dadosReservas = await respostaReservas.json()

  return {
    quartos: dadosQuartos,
    hospedes: dadosHospedes,
    reservas: dadosReservas,
  }
}

export async function cadastrarQuartoNoServidor(quarto) {
  const resposta = await fetch(`${API_URL}/quartos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...quarto,
      capacidade: Number(quarto.capacidade),
      valor_diaria: Number(quarto.valor_diaria),
    }),
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao cadastrar quarto.')
  }

  return dados
}

export async function cadastrarHospedeNoServidor(hospede) {
  const resposta = await fetch(`${API_URL}/hospedes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nome: hospede.nome,
      cpf: hospede.cpf,
      telefone: hospede.telefone,
      email: hospede.email,
      endereco: hospede.endereco,
      observacoes: hospede.observacoes,
    }),
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao cadastrar hospede.')
  }

  return dados
}

export async function atualizarHospedeNoServidor(hospede) {
  const resposta = await fetch(`${API_URL}/hospedes/${hospede.id_hospede}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nome: hospede.nome,
      cpf: hospede.cpf,
      telefone: hospede.telefone,
      email: hospede.email,
      endereco: hospede.endereco,
      observacoes: hospede.observacoes,
    }),
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao atualizar hospede.')
  }

  return dados
}

export async function cadastrarReservaNoServidor(reserva) {
  const resposta = await fetch(`${API_URL}/reservas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id_hospede: reserva.id_hospede,
      id_quarto: reserva.id_quarto,
      situacao: reserva.situacao,
      data_entrada: reserva.data_entrada,
      data_saida: reserva.data_saida,
      valor_diaria: Number(reserva.valor_diaria),
      cafe_manha: reserva.cafe_manha,
      adultos: Number(reserva.adultos),
      criancas: Number(reserva.criancas),
      observacao: reserva.observacao,
    }),
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao cadastrar reserva.')
  }

  return dados
}

export async function atualizarStatusQuartoNoServidor(quarto, novoStatus) {
  const resposta = await fetch(`${API_URL}/quartos/${quarto.id_quarto}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      numero: quarto.numero,
      tipo: quarto.tipo,
      capacidade: Number(quarto.capacidade),
      valor_diaria: Number(quarto.valor_diaria),
      status: novoStatus,
      descricao: quarto.descricao || null,
    }),
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao atualizar status do quarto.')
  }

  return dados
}
