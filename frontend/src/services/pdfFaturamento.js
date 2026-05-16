import {
  calcularDiarias,
  formatarCodigoReserva,
  formatarData,
  formatarMoeda,
} from './financeiro'

const larguraPagina = 595.28
const alturaPagina = 841.89
const margem = 42
const azul = [24, 66, 123]
const cinzaTexto = [65, 78, 96]
const cinzaLinha = [222, 228, 236]
const cinzaFundo = [246, 248, 251]
const verde = [22, 132, 87]

function limparTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escaparPdf(texto) {
  return limparTexto(texto).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function cor([r, g, b]) {
  return `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)}`
}

function baixarBlob(conteudo, nomeArquivo) {
  const blob = new Blob([conteudo], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function quebrarTexto(texto, larguraMaxima, tamanho = 10) {
  const palavras = limparTexto(texto).split(' ')
  const linhas = []
  let linhaAtual = ''
  const larguraMedia = tamanho * 0.52

  palavras.forEach((palavra) => {
    const proximaLinha = linhaAtual ? `${linhaAtual} ${palavra}` : palavra

    if (proximaLinha.length * larguraMedia <= larguraMaxima) {
      linhaAtual = proximaLinha
      return
    }

    if (linhaAtual) {
      linhas.push(linhaAtual)
    }

    linhaAtual = palavra
  })

  if (linhaAtual) {
    linhas.push(linhaAtual)
  }

  return linhas.length > 0 ? linhas : ['-']
}

function criarDocumentoPdf() {
  const paginas = []
  let comandos = []
  let y = margem

  function novaPagina() {
    if (comandos.length > 0) {
      paginas.push(comandos.join('\n'))
    }

    comandos = []
    y = margem
  }

  function garantirEspaco(altura) {
    if (y + altura > alturaPagina - margem) {
      novaPagina()
      desenharCabecalhoSecundario()
    }
  }

  function texto(conteudo, x, yTopo, opcoes = {}) {
    const tamanho = opcoes.tamanho || 10
    const fonte = opcoes.negrito ? 'F2' : 'F1'
    const [r, g, b] = opcoes.cor || cinzaTexto
    const yPdf = alturaPagina - yTopo

    comandos.push(
      `BT /${fonte} ${tamanho} Tf ${cor([r, g, b])} rg ${x.toFixed(2)} ${yPdf.toFixed(2)} Td (${escaparPdf(
        conteudo,
      )}) Tj ET`,
    )
  }

  function retangulo(x, yTopo, largura, altura, corFundo) {
    comandos.push(
      `${cor(corFundo)} rg ${x.toFixed(2)} ${(alturaPagina - yTopo - altura).toFixed(
        2,
      )} ${largura.toFixed(2)} ${altura.toFixed(2)} re f`,
    )
  }

  function linha(x1, yTopo, x2, corLinha = cinzaLinha) {
    const yPdf = alturaPagina - yTopo
    comandos.push(
      `${cor(corLinha)} RG 0.8 w ${x1.toFixed(2)} ${yPdf.toFixed(2)} m ${x2.toFixed(
        2,
      )} ${yPdf.toFixed(2)} l S`,
    )
  }

  function desenharCabecalho(titulo, subtitulo) {
    retangulo(0, 0, larguraPagina, 112, azul)
    texto('HOTEL TCC', margem, 42, {
      tamanho: 11,
      negrito: true,
      cor: [255, 255, 255],
    })
    texto(titulo, margem, 72, {
      tamanho: 22,
      negrito: true,
      cor: [255, 255, 255],
    })
    texto(subtitulo, margem, 96, {
      tamanho: 10,
      cor: [218, 228, 240],
    })
    y = 142
  }

  function desenharCabecalhoSecundario() {
    texto('HOTEL TCC', margem, 32, {
      tamanho: 10,
      negrito: true,
      cor: azul,
    })
    linha(margem, 48, larguraPagina - margem)
    y = 72
  }

  function blocoResumo(itens) {
    const larguraItem = (larguraPagina - margem * 2 - 18) / 3

    garantirEspaco(86)
    itens.forEach((item, indice) => {
      const x = margem + indice * (larguraItem + 9)
      retangulo(x, y, larguraItem, 70, cinzaFundo)
      texto(item.rotulo, x + 14, y + 24, { tamanho: 9, cor: [96, 108, 124] })
      texto(item.valor, x + 14, y + 52, {
        tamanho: 15,
        negrito: true,
        cor: item.destaque ? verde : azul,
      })
    })
    y += 94
  }

  function campo(rotulo, valor, x, largura) {
    texto(rotulo, x, y, { tamanho: 8, negrito: true, cor: [106, 118, 133] })
    quebrarTexto(valor || '-', largura, 10)
      .slice(0, 2)
      .forEach((linhaTexto, indice) => {
        texto(linhaTexto, x, y + 18 + indice * 13, {
          tamanho: 10,
          cor: [33, 43, 54],
        })
      })
  }

  function blocoDados(titulo, itens) {
    const larguraConteudo = larguraPagina - margem * 2
    const colunas = 2
    const larguraCampo = (larguraConteudo - 22) / colunas
    const linhas = Math.ceil(itens.length / colunas)

    garantirEspaco(48 + linhas * 48)
    texto(titulo, margem, y, { tamanho: 13, negrito: true, cor: azul })
    y += 24

    itens.forEach((item, indice) => {
      const coluna = indice % colunas
      const linhaAtual = Math.floor(indice / colunas)
      const x = margem + coluna * (larguraCampo + 22)
      const yAnterior = y

      y = yAnterior + linhaAtual * 48
      campo(item.rotulo, item.valor, x, larguraCampo)
      y = yAnterior
    })

    y += linhas * 48 + 12
  }

  function tabela(titulo, colunas, linhas) {
    const larguraConteudo = larguraPagina - margem * 2
    const larguraColunas = colunas.map((coluna) => coluna.largura * larguraConteudo)

    garantirEspaco(62)
    texto(titulo, margem, y, { tamanho: 13, negrito: true, cor: azul })
    y += 20
    retangulo(margem, y, larguraConteudo, 24, azul)

    let x = margem + 8
    colunas.forEach((coluna, indice) => {
      texto(coluna.titulo, x, y + 16, {
        tamanho: 8,
        negrito: true,
        cor: [255, 255, 255],
      })
      x += larguraColunas[indice]
    })
    y += 30

    linhas.forEach((linhaDados, indiceLinha) => {
      const linhasQuebradas = colunas.map((coluna) =>
        quebrarTexto(linhaDados[coluna.chave], larguraColunas[colunas.indexOf(coluna)] - 10, 8),
      )
      const alturaLinha = Math.max(30, Math.max(...linhasQuebradas.map((linhasTexto) => linhasTexto.length)) * 11 + 14)

      garantirEspaco(alturaLinha + 8)

      if (indiceLinha % 2 === 0) {
        retangulo(margem, y - 7, larguraConteudo, alturaLinha, [250, 251, 253])
      }

      x = margem + 8
      colunas.forEach((coluna, indiceColuna) => {
        linhasQuebradas[indiceColuna].slice(0, 3).forEach((linhaTexto, indiceTexto) => {
          texto(linhaTexto, x, y + 8 + indiceTexto * 11, {
            tamanho: 8,
            cor: [43, 53, 68],
          })
        })
        x += larguraColunas[indiceColuna]
      })

      y += alturaLinha
      linha(margem, y - 4, larguraPagina - margem)
    })

    y += 20
  }

  function gerar() {
    if (comandos.length > 0) {
      paginas.push(comandos.join('\n'))
    }

    const objetos = [
      '',
      '<< /Type /Catalog /Pages 2 0 R >>',
      '',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    ]
    const paginasIds = []

    paginas.forEach((conteudo) => {
      const conteudoId = objetos.length
      objetos.push(`<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`)
      const paginaId = objetos.length
      paginasIds.push(paginaId)
      objetos.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${larguraPagina} ${alturaPagina}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${conteudoId} 0 R >>`,
      )
    })

    objetos[2] = `<< /Type /Pages /Kids [${paginasIds
      .map((id) => `${id} 0 R`)
      .join(' ')}] /Count ${paginasIds.length} >>`

    const partes = ['%PDF-1.4\n']
    const offsets = [0]

    objetos.forEach((objeto, indice) => {
      if (indice === 0) {
        return
      }

      offsets[indice] = partes.join('').length
      partes.push(`${indice} 0 obj\n${objeto}\nendobj\n`)
    })

    const inicioXref = partes.join('').length
    partes.push(`xref\n0 ${objetos.length}\n0000000000 65535 f \n`)

    for (let indice = 1; indice < objetos.length; indice += 1) {
      partes.push(`${String(offsets[indice]).padStart(10, '0')} 00000 n \n`)
    }

    partes.push(
      `trailer\n<< /Size ${objetos.length} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`,
    )

    return partes.join('')
  }

  return {
    blocoDados,
    blocoResumo,
    desenharCabecalho,
    gerar,
    tabela,
  }
}

function nomeArquivo(prefixo) {
  const agora = new Date()
  const data = agora.toISOString().slice(0, 10)
  const hora = agora.toTimeString().slice(0, 5).replace(':', '')

  return `${prefixo}-${data}-${hora}.pdf`
}

export function baixarPdfFaturamentoReservas({ faturamento, reservas, pagamentos }) {
  const pdf = criarDocumentoPdf()
  const total = pagamentos.reduce(
    (soma, pagamento) => soma + Number(pagamento.valor || 0),
    0,
  )

  pdf.desenharCabecalho(
    'Faturamento de reservas',
    `Documento gerado em ${formatarData(new Date().toISOString())}`,
  )
  pdf.blocoResumo([
    { rotulo: 'Reservas', valor: String(reservas.length) },
    { rotulo: 'Total faturado', valor: formatarMoeda(total), destaque: true },
    { rotulo: 'Status', valor: faturamento.concluido ? 'Recebido' : 'Pendente' },
  ])
  pdf.blocoDados('Dados do faturamento', [
    { rotulo: 'Faturar para', valor: faturamento.faturarPara || 'Nao informado' },
    { rotulo: 'Descricao', valor: faturamento.descricao },
    { rotulo: 'Forma de pagamento', valor: faturamento.forma },
    { rotulo: 'Conta', valor: faturamento.conta },
    { rotulo: 'Emissao', valor: formatarData(faturamento.emissao) },
    { rotulo: 'Vencimento', valor: formatarData(faturamento.vencimento) },
  ])
  pdf.tabela(
    'Reservas faturadas',
    [
      { titulo: 'Reserva', chave: 'codigo', largura: 0.17 },
      { titulo: 'Hospede', chave: 'hospede', largura: 0.25 },
      { titulo: 'Quarto', chave: 'quarto', largura: 0.13 },
      { titulo: 'Periodo', chave: 'periodo', largura: 0.22 },
      { titulo: 'Valor', chave: 'valor', largura: 0.13 },
      { titulo: 'Situacao', chave: 'situacao', largura: 0.1 },
    ],
    reservas.map((reserva) => ({
      codigo: formatarCodigoReserva(reserva.id_reserva),
      hospede: reserva.nome_hospede || 'Hospede nao informado',
      quarto: `Quarto ${reserva.numero_quarto || '-'}`,
      periodo: `${formatarData(reserva.data_entrada)} ate ${formatarData(
        reserva.data_saida,
      )} (${calcularDiarias(reserva.data_entrada, reserva.data_saida)} diaria(s))`,
      valor: formatarMoeda(reserva.valor_pendente),
      situacao: reserva.situacao || '-',
    })),
  )

  baixarBlob(pdf.gerar(), nomeArquivo('faturamento-reservas'))
}

export function baixarPdfFaturamentoAvulso({ faturamento }) {
  const pdf = criarDocumentoPdf()
  const quartos = faturamento.quartos_faturados || []
  const itens = faturamento.itens || []
  const quantidadeItens = itens.length || quartos.length || 1
  const subtotalGeral = Number(faturamento.subtotal_geral || faturamento.valor || 0)
  const desconto = Number(faturamento.desconto || 0)
  const totalFinal = Number(faturamento.total_final || faturamento.valor || 0)

  pdf.desenharCabecalho(
    'Faturamento avulso',
    `Documento gerado em ${formatarData(new Date().toISOString())}`,
  )
  pdf.blocoResumo([
    { rotulo: 'Itens', valor: String(quantidadeItens) },
    {
      rotulo: 'Total faturado',
      valor: formatarMoeda(totalFinal),
      destaque: true,
    },
    { rotulo: 'Status', valor: faturamento.concluido ? 'Recebido' : 'Pendente' },
  ])
  pdf.blocoDados('Dados do faturamento', [
    { rotulo: 'Faturar para', valor: faturamento.faturarPara || 'Nao informado' },
    { rotulo: 'Descricao', valor: faturamento.descricao },
    { rotulo: 'Forma de pagamento', valor: faturamento.forma },
    { rotulo: 'Conta', valor: faturamento.conta },
    { rotulo: 'Emissao', valor: formatarData(faturamento.emissao) },
    { rotulo: 'Vencimento', valor: formatarData(faturamento.vencimento) },
    { rotulo: 'Subtotal geral', valor: formatarMoeda(subtotalGeral) },
    { rotulo: 'Desconto', valor: formatarMoeda(desconto) },
  ])

  if (itens.length > 0) {
    pdf.tabela(
      'Itens do faturamento',
      [
        { titulo: 'Quarto', chave: 'quarto', largura: 0.17 },
        { titulo: 'Periodo', chave: 'periodo', largura: 0.28 },
        { titulo: 'Pessoas', chave: 'pessoas', largura: 0.18 },
        { titulo: 'Diarias', chave: 'diarias', largura: 0.12 },
        { titulo: 'Subtotal', chave: 'subtotal', largura: 0.25 },
      ],
      itens.map((item) => ({
        quarto: `Quarto ${
          quartos.find((quarto) => Number(quarto.id_quarto) === Number(item.id_quarto))
            ?.numero || item.id_quarto || '-'
        }`,
        periodo: `${formatarData(item.data_entrada)} ate ${formatarData(item.data_saida)}`,
        pessoas: `${item.adultos || 0} adulto(s), ${item.criancas || 0} crianca(s)`,
        diarias: String(item.quantidade_diarias || 0),
        subtotal: formatarMoeda(item.subtotal),
      })),
    )
  } else if (quartos.length > 0) {
    pdf.tabela(
      'Quartos faturados',
      [
        { titulo: 'Quarto', chave: 'quarto', largura: 0.18 },
        { titulo: 'Tipo', chave: 'tipo', largura: 0.22 },
        { titulo: 'Periodo', chave: 'periodo', largura: 0.3 },
        { titulo: 'Diarias', chave: 'diarias', largura: 0.12 },
        { titulo: 'Valor', chave: 'valor', largura: 0.18 },
      ],
      quartos.map((quarto) => ({
        quarto: `Quarto ${quarto.numero || '-'}`,
        tipo: quarto.tipo || 'Nao informado',
        periodo: `${formatarData(quarto.data_entrada || faturamento.data_entrada)} ate ${formatarData(
          quarto.data_saida || faturamento.data_saida,
        )}`,
        diarias: String(quarto.diarias || faturamento.diarias || 0),
        valor: formatarMoeda(
          quarto.subtotal ||
            Number(quarto.valor_diaria || 0) *
              Number(quarto.diarias || faturamento.diarias || 0),
        ),
      })),
    )
  }

  baixarBlob(pdf.gerar(), nomeArquivo('faturamento-avulso'))
}
