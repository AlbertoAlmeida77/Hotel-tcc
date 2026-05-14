const API_URL = 'http://localhost:3000'
const TEMPO_LIMITE_REQUISICAO = 8000

async function fetchComTimeout(url, opcoes = {}) {
  const controle = new AbortController()
  const timeout = setTimeout(() => controle.abort(), TEMPO_LIMITE_REQUISICAO)

  try {
    return await fetch(url, {
      ...opcoes,
      signal: controle.signal,
    })
  } catch (erro) {
    if (erro.name === 'AbortError') {
      throw new Error(
        'O servidor demorou para responder. Verifique se o MySQL e o backend estao funcionando.',
        { cause: erro },
      )
    }

    throw erro
  } finally {
    clearTimeout(timeout)
  }
}

export async function buscarDadosDoServidor() {
  const [respostaQuartos, respostaHospedes, respostaReservas] = await Promise.all([
    fetchComTimeout(`${API_URL}/quartos`),
    fetchComTimeout(`${API_URL}/hospedes`),
    fetchComTimeout(`${API_URL}/reservas`),
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
  const resposta = await fetchComTimeout(`${API_URL}/quartos`, {
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

export async function atualizarQuartoNoServidor(quarto) {
  const resposta = await fetchComTimeout(`${API_URL}/quartos/${quarto.id_quarto}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      numero: quarto.numero,
      tipo: quarto.tipo,
      capacidade: Number(quarto.capacidade),
      valor_diaria: Number(quarto.valor_diaria),
      status: quarto.status,
      descricao: quarto.descricao || null,
    }),
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao atualizar quarto.')
  }

  return dados
}

export async function cadastrarHospedeNoServidor(hospede) {
  const resposta = await fetchComTimeout(`${API_URL}/hospedes`, {
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
  const resposta = await fetchComTimeout(`${API_URL}/hospedes/${hospede.id_hospede}`, {
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
  const resposta = await fetchComTimeout(`${API_URL}/reservas`, {
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

export async function atualizarReservaNoServidor(reserva) {
  const resposta = await fetchComTimeout(`${API_URL}/reservas/${reserva.id_reserva}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id_hospede: reserva.id_hospede,
      id_quarto: reserva.id_quarto,
      situacao: reserva.situacao,
      data_entrada: String(reserva.data_entrada).slice(0, 10),
      data_saida: String(reserva.data_saida).slice(0, 10),
      valor_diaria: Number(reserva.valor_diaria),
      cafe_manha: Boolean(reserva.cafe_manha),
      adultos: Number(reserva.adultos || 1),
      criancas: Number(reserva.criancas || 0),
      observacao: reserva.observacao,
    }),
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao atualizar reserva.')
  }

  return dados
}

export async function atualizarStatusQuartoNoServidor(quarto, novoStatus) {
  const resposta = await fetchComTimeout(`${API_URL}/quartos/${quarto.id_quarto}`, {
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

export async function excluirQuartoNoServidor(idQuarto) {
  const resposta = await fetchComTimeout(`${API_URL}/quartos/${idQuarto}`, {
    method: 'DELETE',
  })
  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao excluir quarto.')
  }

  return dados
}

export async function excluirHospedeNoServidor(idHospede) {
  const resposta = await fetchComTimeout(`${API_URL}/hospedes/${idHospede}`, {
    method: 'DELETE',
  })
  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao excluir hospede.')
  }

  return dados
}

export async function excluirReservaNoServidor(idReserva) {
  const resposta = await fetchComTimeout(`${API_URL}/reservas/${idReserva}`, {
    method: 'DELETE',
  })
  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao excluir reserva.')
  }

  return dados
}
