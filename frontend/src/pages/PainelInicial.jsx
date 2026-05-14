import { useEffect, useState } from 'react'
import DashboardQuartos from '../components/DashboardQuartos'
import DetalhesReserva from '../components/DetalhesReserva'
import FormularioHospede from '../components/FormularioHospede'
import FormularioQuarto from '../components/FormularioQuarto'
import FormularioReserva from '../components/FormularioReserva'
import ListaHospedes from '../components/ListaHospedes'
import ListaQuartos from '../components/ListaQuartos'
import ListaReservas from '../components/ListaReservas'
import ModalHospedeReserva from '../components/ModalHospedeReserva'
import ModalPagamento from '../components/ModalPagamento'
import Transacoes from '../components/Transacoes'
import {
  atualizarQuartoNoServidor,
  atualizarReservaNoServidor,
  atualizarStatusQuartoNoServidor,
  atualizarHospedeNoServidor,
  buscarDadosDoServidor,
  cadastrarHospedeNoServidor,
  cadastrarQuartoNoServidor,
  cadastrarReservaNoServidor,
  excluirHospedeNoServidor,
  excluirQuartoNoServidor,
  excluirReservaNoServidor,
} from '../services/api'
import {
  calcularTotalReserva,
  criarPagamentoDaReserva,
} from '../services/financeiro'

const quartoVazio = {
  numero: '',
  tipo: '',
  capacidade: '',
  valor_diaria: '',
  status: 'Disponivel',
  descricao: '',
}

const hospedeVazio = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  endereco: '',
  observacoes: '',
}

const reservaVazia = {
  situacao: 'pre-reservar',
  id_hospede: '',
  id_quarto: '',
  data_entrada: '',
  data_saida: '',
  valor_diaria: '',
  cafe_manha: false,
  adultos: '1',
  criancas: '0',
  observacao: '',
}

const textosPaginas = {
  painel: {
    titulo: 'Painel inicial',
    descricao: 'Veja os quartos e hóspedes cadastrados no banco de dados.',
  },
  quartos: {
    titulo: 'Quartos',
    descricao: 'Cadastre quartos e acompanhe a lista de quartos do hotel.',
  },
  hospedes: {
    titulo: 'Hóspedes',
    descricao: 'Consulte os hóspedes cadastrados no sistema.',
  },
  reservas: {
    titulo: 'Reservas',
    descricao: 'Área reservada para o controle de reservas do hotel.',
  },
  transacoes: {
    titulo: 'Transações',
    descricao: 'Controle os pagamentos e valores das hospedagens.',
  },
}

function IconeAcao({ tipo }) {
  const icones = {
    adicionar: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    voltar: (
      <>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </>
    ),
    fechar: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {icones[tipo]}
    </svg>
  )
}

function PainelInicial({ paginaAtual, localizacaoAtual, onMudarPagina }) {
  const [quartos, setQuartos] = useState([])
  const [hospedes, setHospedes] = useState([])
  const [reservas, setReservas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [salvandoQuarto, setSalvandoQuarto] = useState(false)
  const [salvandoHospede, setSalvandoHospede] = useState(false)
  const [salvandoReserva, setSalvandoReserva] = useState(false)
  const [mensagemQuarto, setMensagemQuarto] = useState('')
  const [novoQuarto, setNovoQuarto] = useState(quartoVazio)
  const [modoQuartos, setModoQuartos] = useState('lista')
  const [modoFormularioQuarto, setModoFormularioQuarto] = useState('cadastrar')
  const [novoHospede, setNovoHospede] = useState(hospedeVazio)
  const [novaReserva, setNovaReserva] = useState(reservaVazia)
  const [reservaSelecionada, setReservaSelecionada] = useState(null)
  const [pagamentos, setPagamentos] = useState(() => {
    const pagamentosSalvos = localStorage.getItem('hotel-tcc-pagamentos')

    return pagamentosSalvos ? JSON.parse(pagamentosSalvos) : []
  })
  const [reservaPagamento, setReservaPagamento] = useState(null)
  const [pagamentoAtual, setPagamentoAtual] = useState(null)
  const [modalHospedeReservaAberto, setModalHospedeReservaAberto] =
    useState(false)
  const [hospedeRapido, setHospedeRapido] = useState(hospedeVazio)
  const [salvandoHospedeRapido, setSalvandoHospedeRapido] = useState(false)
  const [modoReservas, setModoReservas] = useState('lista')
  const [hospedeSelecionado, setHospedeSelecionado] = useState(null)
  const [modoHospedes, setModoHospedes] = useState('lista')
  const [modoFormularioHospede, setModoFormularioHospede] =
    useState('cadastrar')

  async function carregarDados() {
    try {
      setCarregando(true)
      setErro('')

      const dados = await buscarDadosDoServidor()
      setQuartos(dados.quartos)
      setHospedes(dados.hospedes)
      setReservas(dados.reservas)
    } catch (erroAtual) {
      setErro(erroAtual.message)
    } finally {
      setCarregando(false)
    }
  }

  function mostrarMensagemQuarto(mensagem) {
    setMensagemQuarto(mensagem)

    setTimeout(() => {
      setMensagemQuarto('')
    }, 2000)
  }

  function atualizarCampoQuarto(evento) {
    const { name, value } = evento.target

    setNovoQuarto((quartoAtual) => ({
      ...quartoAtual,
      [name]: value,
    }))
  }

  function atualizarCampoHospede(evento) {
    const { name, value } = evento.target

    setNovoHospede((hospedeAtual) => ({
      ...hospedeAtual,
      [name]: value,
    }))
  }

  function atualizarCampoHospedeRapido(evento) {
    const { name, value } = evento.target

    setHospedeRapido((hospedeAtual) => ({
      ...hospedeAtual,
      [name]: value,
    }))
  }

  function atualizarCampoReserva(evento) {
    const { checked, name, type, value } = evento.target
    const novoValor = type === 'checkbox' ? checked : value

    setNovaReserva((reservaAtual) => {
      if (name === 'id_quarto') {
        const quartoSelecionado = quartos.find(
          (quarto) => String(quarto.id_quarto) === value,
        )

        return {
          ...reservaAtual,
          id_quarto: value,
          valor_diaria: quartoSelecionado?.valor_diaria || '',
        }
      }

      return {
        ...reservaAtual,
        [name]: novoValor,
      }
    })
  }

  async function cadastrarQuarto(evento) {
    evento.preventDefault()

    try {
      setSalvandoQuarto(true)
      setMensagemQuarto('')
      setErro('')

      if (modoFormularioQuarto === 'editar') {
        await atualizarQuartoNoServidor(novoQuarto)
        mostrarMensagemQuarto('Quarto atualizado com sucesso.')
      } else {
        await cadastrarQuartoNoServidor(novoQuarto)
        mostrarMensagemQuarto('Quarto cadastrado com sucesso.')
      }

      setNovoQuarto(quartoVazio)
      setModoFormularioQuarto('cadastrar')
      setModoQuartos('lista')
      onMudarPagina('quartos')
      carregarDados()
    } catch (erroAtual) {
      setErro(erroAtual.message)
    } finally {
      setSalvandoQuarto(false)
    }
  }

  function editarQuarto(quarto) {
    setNovoQuarto({
      id_quarto: quarto.id_quarto,
      numero: quarto.numero || '',
      tipo: quarto.tipo || '',
      capacidade: quarto.capacidade || '',
      valor_diaria: quarto.valor_diaria || '',
      status: quarto.status || 'Disponivel',
      descricao: quarto.descricao || '',
    })
    setModoFormularioQuarto('editar')
    setModoQuartos('formulario')
    onMudarPagina('quartos', {
      modo: 'editar',
      id: quarto.id_quarto,
    })
  }

  function cancelarEdicaoQuarto() {
    setNovoQuarto(quartoVazio)
    setModoFormularioQuarto('cadastrar')
    setModoQuartos('lista')
    onMudarPagina('quartos')
  }

  function abrirCadastroQuarto() {
    setNovoQuarto(quartoVazio)
    setModoFormularioQuarto('cadastrar')
    setModoQuartos('formulario')
    onMudarPagina('quartos', { modo: 'novo' })
  }

  async function cadastrarHospede(evento) {
    evento.preventDefault()

    try {
      setSalvandoHospede(true)
      setMensagemQuarto('')
      setErro('')

      if (modoFormularioHospede === 'editar') {
        await atualizarHospedeNoServidor(novoHospede)
        mostrarMensagemQuarto('Hospede atualizado com sucesso.')
      } else {
        await cadastrarHospedeNoServidor(novoHospede)
        mostrarMensagemQuarto('Hospede cadastrado com sucesso.')
      }

      setNovoHospede(hospedeVazio)
      setModoFormularioHospede('cadastrar')
      setHospedeSelecionado(null)
      setModoHospedes('lista')
      onMudarPagina('hospedes')
      carregarDados()
    } catch (erroAtual) {
      setErro(erroAtual.message)
    } finally {
      setSalvandoHospede(false)
    }
  }

  function abrirCadastroHospede() {
    setNovoHospede(hospedeVazio)
    setHospedeSelecionado(null)
    setModoFormularioHospede('cadastrar')
    setModoHospedes('formulario')
    onMudarPagina('hospedes', { modo: 'novo' })
  }

  function visualizarHospede(hospede) {
    setHospedeSelecionado(hospede)
    setModoHospedes('detalhes')
    onMudarPagina('hospedes', {
      modo: 'detalhes',
      id: hospede.id_hospede,
    })
  }

  function editarHospede(hospede) {
    setNovoHospede({
      id_hospede: hospede.id_hospede,
      nome: hospede.nome || '',
      cpf: hospede.cpf || '',
      telefone: hospede.telefone || '',
      email: hospede.email || '',
      endereco: hospede.endereco || '',
      observacoes: hospede.observacoes || '',
    })
    setHospedeSelecionado(null)
    setModoFormularioHospede('editar')
    setModoHospedes('formulario')
    onMudarPagina('hospedes', {
      modo: 'editar',
      id: hospede.id_hospede,
    })
  }

  function editarHospedePeloPainel(hospede) {
    editarHospede(hospede)
  }

  function fecharFormularioHospede() {
    setNovoHospede(hospedeVazio)
    setModoFormularioHospede('cadastrar')
    setHospedeSelecionado(null)
    setModoHospedes('lista')
    onMudarPagina('hospedes')
  }

  async function excluirQuarto(quarto) {
    const confirmou = window.confirm(
      `Deseja excluir o quarto ${quarto.numero}?`,
    )

    if (!confirmou) {
      return
    }

    try {
      setErro('')
      await excluirQuartoNoServidor(quarto.id_quarto)
      setQuartos((quartosAtuais) =>
        quartosAtuais.filter(
          (quartoAtual) => quartoAtual.id_quarto !== quarto.id_quarto,
        ),
      )
      if (novoQuarto.id_quarto === quarto.id_quarto) {
        cancelarEdicaoQuarto()
      }
      mostrarMensagemQuarto('Quarto excluido com sucesso.')
    } catch (erroAtual) {
      setErro(erroAtual.message)
    }
  }

  async function excluirHospede(hospede) {
    const confirmou = window.confirm(
      `Deseja excluir o hospede ${hospede.nome}?`,
    )

    if (!confirmou) {
      return
    }

    try {
      setErro('')
      await excluirHospedeNoServidor(hospede.id_hospede)
      setHospedes((hospedesAtuais) =>
        hospedesAtuais.filter(
          (hospedeAtual) => hospedeAtual.id_hospede !== hospede.id_hospede,
        ),
      )

      if (hospedeSelecionado?.id_hospede === hospede.id_hospede) {
        setHospedeSelecionado(null)
      }

      mostrarMensagemQuarto('Hospede excluido com sucesso.')
    } catch (erroAtual) {
      setErro(erroAtual.message)
    }
  }

  async function excluirReserva(reserva) {
    const confirmou = window.confirm(
      `Deseja excluir a reserva HO:${String(reserva.id_reserva).padStart(
        6,
        '0',
      )}?`,
    )

    if (!confirmou) {
      return
    }

    try {
      setErro('')
      await excluirReservaNoServidor(reserva.id_reserva)
      setReservas((reservasAtuais) =>
        reservasAtuais.filter(
          (reservaAtual) => reservaAtual.id_reserva !== reserva.id_reserva,
        ),
      )
      setPagamentos((pagamentosAtuais) =>
        pagamentosAtuais.filter(
          (pagamento) =>
            Number(pagamento.id_reserva) !== Number(reserva.id_reserva),
        ),
      )

      if (reservaSelecionada?.id_reserva === reserva.id_reserva) {
        voltarParaListaReservas()
      }

      mostrarMensagemQuarto('Reserva excluida com sucesso.')
    } catch (erroAtual) {
      setErro(erroAtual.message)
    }
  }

  async function adicionarReserva(evento) {
    evento.preventDefault()

    try {
      setSalvandoReserva(true)
      setErro('')
      const resultado = await cadastrarReservaNoServidor(novaReserva)
      const dadosAtualizados = await buscarDadosDoServidor()
      const reservaCriada = dadosAtualizados.reservas.find(
        (reserva) => Number(reserva.id_reserva) === Number(resultado.id_reserva),
      )

      setQuartos(dadosAtualizados.quartos)
      setHospedes(dadosAtualizados.hospedes)
      setReservas(dadosAtualizados.reservas)
      setReservaSelecionada(reservaCriada || null)
      setNovaReserva(reservaVazia)
      setModoReservas(reservaCriada ? 'detalhes' : 'lista')
      onMudarPagina(
        'reservas',
        reservaCriada
          ? { modo: 'detalhes', id: reservaCriada.id_reserva }
          : {},
      )
      mostrarMensagemQuarto('Reserva cadastrada com sucesso.')
    } catch (erroAtual) {
      setErro(erroAtual.message)
    } finally {
      setSalvandoReserva(false)
    }
  }

  function abrirNovaReserva() {
    setNovaReserva(reservaVazia)
    setReservaSelecionada(null)
    setModoReservas('formulario')
    onMudarPagina('reservas', { modo: 'nova' })
  }

  function abrirModalHospedeReserva() {
    setHospedeRapido(hospedeVazio)
    setModalHospedeReservaAberto(true)
  }

  function fecharModalHospedeReserva() {
    setHospedeRapido(hospedeVazio)
    setModalHospedeReservaAberto(false)
  }

  async function cadastrarHospedePelaReserva(evento) {
    evento.preventDefault()

    try {
      setSalvandoHospedeRapido(true)
      setErro('')

      const resultado = await cadastrarHospedeNoServidor(hospedeRapido)
      const dadosAtualizados = await buscarDadosDoServidor()

      setHospedes(dadosAtualizados.hospedes)
      setQuartos(dadosAtualizados.quartos)
      setReservas(dadosAtualizados.reservas)
      setNovaReserva((reservaAtual) => ({
        ...reservaAtual,
        id_hospede: String(resultado.id_hospede),
      }))
      fecharModalHospedeReserva()
      mostrarMensagemQuarto('Hospede cadastrado e selecionado.')
    } catch (erroAtual) {
      setErro(erroAtual.message)
    } finally {
      setSalvandoHospedeRapido(false)
    }
  }

  function criarHospedagemPeloPainel(quarto) {
    setNovaReserva({
      ...reservaVazia,
      id_quarto: String(quarto.id_quarto),
      valor_diaria: quarto.valor_diaria || '',
      situacao: 'hospedar',
    })
    setReservaSelecionada(null)
    setModoReservas('formulario')
    onMudarPagina('reservas', {
      modo: 'nova',
      quarto: quarto.id_quarto,
    })
  }

  function verHospedagemPeloPainel(reserva) {
    setReservaSelecionada(reserva)
    setModoReservas('detalhes')
    onMudarPagina('reservas', {
      modo: 'detalhes',
      id: reserva.id_reserva,
    })
  }

  function voltarParaListaReservas() {
    setReservaSelecionada(null)
    setModoReservas('lista')
    onMudarPagina('reservas')
  }

  function abrirPagamento(reserva) {
    const totalReserva = calcularTotalReserva(reserva)
    const recebido = pagamentos
      .filter(
        (pagamento) =>
          Number(pagamento.id_reserva) === Number(reserva.id_reserva) &&
          pagamento.concluido,
      )
      .reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0)
    const valorPendente = Math.max(totalReserva - recebido, 0)

    setReservaPagamento(reserva)
    setPagamentoAtual(criarPagamentoDaReserva(reserva, valorPendente))
  }

  function abrirCheckoutPeloPainel(reserva) {
    setReservaSelecionada(reserva)
    setModoReservas('detalhes')
    onMudarPagina('reservas', {
      modo: 'detalhes',
      id: reserva.id_reserva,
    })
  }

  function fecharPagamento() {
    setReservaPagamento(null)
    setPagamentoAtual(null)
  }

  function atualizarCampoPagamento(evento) {
    const { checked, name, type, value } = evento.target

    setPagamentoAtual((pagamento) => ({
      ...pagamento,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function salvarPagamento(evento) {
    evento.preventDefault()

    const totalReserva = calcularTotalReserva(reservaPagamento)
    const recebido = pagamentos
      .filter(
        (pagamento) =>
          Number(pagamento.id_reserva) === Number(reservaPagamento.id_reserva) &&
          pagamento.concluido,
      )
      .reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0)
    const valorPagamento = Number(pagamentoAtual.valor || 0)
    const valorPendente = Math.max(totalReserva - recebido, 0)

    if (valorPagamento > valorPendente) {
      setErro(
        `O pagamento nao pode ser maior que o valor pendente: R$ ${valorPendente.toFixed(2)}.`,
      )
      return
    }

    const novoPagamento = {
      ...pagamentoAtual,
      id: crypto.randomUUID(),
      valor: valorPagamento,
    }

    setPagamentos((pagamentosAtuais) => [
      novoPagamento,
      ...pagamentosAtuais,
    ])
    fecharPagamento()
    mostrarMensagemQuarto('Pagamento adicionado com sucesso.')
  }

  function excluirPagamento(pagamento) {
    const confirmou = window.confirm(
      `Deseja excluir o pagamento de R$ ${Number(pagamento.valor || 0).toFixed(2)}?`,
    )

    if (!confirmou) {
      return
    }

    setPagamentos((pagamentosAtuais) =>
      pagamentosAtuais.filter(
        (pagamentoAtual) => pagamentoAtual.id !== pagamento.id,
      ),
    )
    mostrarMensagemQuarto('Pagamento excluido com sucesso.')
  }

  async function finalizarCheckout(reserva) {
    const quarto = quartos.find(
      (quartoAtual) =>
        Number(quartoAtual.id_quarto) === Number(reserva.id_quarto),
    )

    if (!quarto) {
      setErro('Quarto da reserva nao encontrado.')
      return
    }

    const confirmou = window.confirm(
      `Confirmar checkout do quarto ${reserva.numero_quarto}?`,
    )

    if (!confirmou) {
      return
    }

    try {
      setErro('')
      await atualizarReservaNoServidor({
        ...reserva,
        situacao: 'finalizado',
      })
      await atualizarStatusQuartoNoServidor(quarto, 'Disponivel')
      const dadosAtualizados = await buscarDadosDoServidor()

      setQuartos(dadosAtualizados.quartos)
      setHospedes(dadosAtualizados.hospedes)
      setReservas(dadosAtualizados.reservas)
      setReservaSelecionada(null)
      setModoReservas('lista')
      onMudarPagina('reservas')
      mostrarMensagemQuarto('Checkout finalizado com sucesso.')
    } catch (erroAtual) {
      setErro(erroAtual.message)
    }
  }

  async function cancelarReserva(reserva) {
    const confirmou = window.confirm(
      `Deseja cancelar a reserva HO:${String(reserva.id_reserva).padStart(
        6,
        '0',
      )}?`,
    )

    if (!confirmou) {
      return
    }

    try {
      setErro('')
      await atualizarReservaNoServidor({
        ...reserva,
        situacao: 'cancelado',
      })

      const dadosAtualizados = await buscarDadosDoServidor()
      const reservaAtualizada = dadosAtualizados.reservas.find(
        (reservaAtual) =>
          Number(reservaAtual.id_reserva) === Number(reserva.id_reserva),
      )

      setQuartos(dadosAtualizados.quartos)
      setHospedes(dadosAtualizados.hospedes)
      setReservas(dadosAtualizados.reservas)
      setReservaSelecionada(reservaAtualizada || null)
      mostrarMensagemQuarto('Reserva cancelada com sucesso.')
    } catch (erroAtual) {
      setErro(erroAtual.message)
    }
  }

  async function salvarAlteracoesReserva(
    reservaAtualizada,
    opcoes = { voltarParaLista: true },
  ) {
    try {
      setErro('')
      await atualizarReservaNoServidor(reservaAtualizada)

      const dadosAtualizados = await buscarDadosDoServidor()
      const reservaSalva = dadosAtualizados.reservas.find(
        (reserva) =>
          Number(reserva.id_reserva) === Number(reservaAtualizada.id_reserva),
      )

      setQuartos(dadosAtualizados.quartos)
      setHospedes(dadosAtualizados.hospedes)
      setReservas(dadosAtualizados.reservas)
      if (opcoes.voltarParaLista) {
        setReservaSelecionada(null)
        setModoReservas('lista')
        onMudarPagina('reservas')
      } else {
        setReservaSelecionada(reservaSalva || null)
      }
      mostrarMensagemQuarto('Reserva atualizada com sucesso.')
    } catch (erroAtual) {
      setErro(erroAtual.message)
    }
  }

  async function reabrirReserva(reserva) {
    const confirmou = window.confirm(
      `Deseja reabrir a reserva HO:${String(reserva.id_reserva).padStart(
        6,
        '0',
      )}?`,
    )

    if (!confirmou) {
      return
    }

    await salvarAlteracoesReserva({
      ...reserva,
      situacao: 'reservar',
    }, { voltarParaLista: false })
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let componenteExiste = true

    buscarDadosDoServidor()
      .then((dados) => {
        if (componenteExiste) {
          setQuartos(dados.quartos)
          setHospedes(dados.hospedes)
          setReservas(dados.reservas)
        }
      })
      .catch((erroAtual) => {
        if (componenteExiste) {
          setErro(erroAtual.message)
        }
      })
      .finally(() => {
        if (componenteExiste) {
          setCarregando(false)
        }
      })

    return () => {
      componenteExiste = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('hotel-tcc-pagamentos', JSON.stringify(pagamentos))
  }, [pagamentos])

  useEffect(() => {
    const parametros = new URLSearchParams(localizacaoAtual.split('?')[1] || '')
    const modo = parametros.get('modo')
    const id = parametros.get('id')

    if (paginaAtual === 'hospedes') {
      if (modo === 'novo') {
        setNovoHospede(hospedeVazio)
        setHospedeSelecionado(null)
        setModoFormularioHospede('cadastrar')
        setModoHospedes('formulario')
        return
      }

      if (modo === 'editar' && id) {
        const hospede = hospedes.find(
          (hospedeAtual) => Number(hospedeAtual.id_hospede) === Number(id),
        )

        if (hospede) {
          setNovoHospede({
            id_hospede: hospede.id_hospede,
            nome: hospede.nome || '',
            cpf: hospede.cpf || '',
            telefone: hospede.telefone || '',
            email: hospede.email || '',
            endereco: hospede.endereco || '',
            observacoes: hospede.observacoes || '',
          })
          setHospedeSelecionado(null)
          setModoFormularioHospede('editar')
          setModoHospedes('formulario')
        }

        return
      }

      if (modo === 'detalhes' && id) {
        const hospede = hospedes.find(
          (hospedeAtual) => Number(hospedeAtual.id_hospede) === Number(id),
        )

        if (hospede) {
          setHospedeSelecionado(hospede)
          setModoHospedes('detalhes')
        }

        return
      }

      setNovoHospede(hospedeVazio)
      setHospedeSelecionado(null)
      setModoFormularioHospede('cadastrar')
      setModoHospedes('lista')
    }

    if (paginaAtual === 'quartos') {
      if (modo === 'novo') {
        setNovoQuarto(quartoVazio)
        setModoFormularioQuarto('cadastrar')
        setModoQuartos('formulario')
        return
      }

      if (modo === 'editar' && id) {
        const quarto = quartos.find(
          (quartoAtual) => Number(quartoAtual.id_quarto) === Number(id),
        )

        if (quarto) {
          setNovoQuarto({
            id_quarto: quarto.id_quarto,
            numero: quarto.numero || '',
            tipo: quarto.tipo || '',
            capacidade: quarto.capacidade || '',
            valor_diaria: quarto.valor_diaria || '',
            status: quarto.status || 'Disponivel',
            descricao: quarto.descricao || '',
          })
          setModoFormularioQuarto('editar')
          setModoQuartos('formulario')
        }

        return
      }

      setNovoQuarto(quartoVazio)
      setModoFormularioQuarto('cadastrar')
      setModoQuartos('lista')
    }

    if (paginaAtual === 'reservas') {
      if (modo === 'nova') {
        const idQuarto = parametros.get('quarto')
        const quarto = quartos.find(
          (quartoAtual) => Number(quartoAtual.id_quarto) === Number(idQuarto),
        )

        setNovaReserva({
          ...reservaVazia,
          id_quarto: quarto ? String(quarto.id_quarto) : '',
          valor_diaria: quarto?.valor_diaria || '',
          situacao: quarto ? 'hospedar' : reservaVazia.situacao,
        })
        setReservaSelecionada(null)
        setModoReservas('formulario')
        return
      }

      if (modo === 'detalhes' && id) {
        const reserva = reservas.find(
          (reservaAtual) => Number(reservaAtual.id_reserva) === Number(id),
        )

        if (reserva) {
          setReservaSelecionada(reserva)
          setModoReservas('detalhes')
        }

        return
      }

      setReservaSelecionada(null)
      setModoReservas('lista')
    }
  }, [hospedes, localizacaoAtual, paginaAtual, quartos, reservas])
  /* eslint-enable react-hooks/set-state-in-effect */

  const textoPagina = textosPaginas[paginaAtual]

  return (
    <main className="app">
      <header className="topo">
        <div>
          <span className="etiqueta">Sistema de Gestão Hoteleira</span>
          <h1>{textoPagina.titulo}</h1>
          <p>{textoPagina.descricao}</p>
        </div>
      </header>

      {erro && <p className="aviso erro">{erro}</p>}
      {mensagemQuarto && <p className="aviso sucesso">{mensagemQuarto}</p>}

      {carregando && paginaAtual === 'painel' && (
        <section className="conteudo">
          <div className="skeleton skeleton-card" style={{ borderRadius: 'var(--radius)', minHeight: '230px' }} />
          <div className="grade-quartos-dashboard">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        </section>
      )}
      {carregando && paginaAtual !== 'painel' && (
        <p className="aviso">Carregando dados...</p>
      )}

      {!carregando && (
        <section className="conteudo">
          {paginaAtual === 'painel' && (
            <DashboardQuartos
              quartos={quartos}
              hospedes={hospedes}
              reservas={reservas}
              onEditarHospede={editarHospedePeloPainel}
              onCriarHospedagem={criarHospedagemPeloPainel}
              onVerHospedagem={verHospedagemPeloPainel}
              onAbrirCheckout={abrirCheckoutPeloPainel}
            />
          )}

          {paginaAtual === 'quartos' && (
            <>
              <div className="barra-acoes">
                {modoQuartos === 'lista' ? (
                  <button
                    type="button"
                    className="botao-com-icone"
                    onClick={abrirCadastroQuarto}
                  >
                    <IconeAcao tipo="adicionar" />
                    Novo quarto
                  </button>
                ) : (
                  <button
                    type="button"
                    className="botao-secundario botao-com-icone"
                    onClick={cancelarEdicaoQuarto}
                  >
                    <IconeAcao tipo="voltar" />
                    Voltar para lista
                  </button>
                )}
              </div>

              {modoQuartos === 'formulario' && (
                <FormularioQuarto
                  novoQuarto={novoQuarto}
                  salvandoQuarto={salvandoQuarto}
                  modo={modoFormularioQuarto}
                  onAtualizarCampo={atualizarCampoQuarto}
                  onCadastrarQuarto={cadastrarQuarto}
                  onCancelar={cancelarEdicaoQuarto}
                />
              )}

              {modoQuartos === 'lista' && (
                <ListaQuartos
                  quartos={quartos}
                  onEditar={editarQuarto}
                  onExcluir={excluirQuarto}
                />
              )}
            </>
          )}

          {paginaAtual === 'hospedes' && (
            <>
              <div className="barra-acoes">
                {modoHospedes === 'lista' ? (
                  <button
                    type="button"
                    className="botao-com-icone"
                    onClick={abrirCadastroHospede}
                  >
                    <IconeAcao tipo="adicionar" />
                    Novo hospede
                  </button>
                ) : (
                  <button
                    type="button"
                    className="botao-secundario botao-com-icone"
                    onClick={fecharFormularioHospede}
                  >
                    <IconeAcao tipo="voltar" />
                    Voltar para lista
                  </button>
                )}
              </div>

              {modoHospedes === 'formulario' && (
                <FormularioHospede
                  novoHospede={novoHospede}
                  salvandoHospede={salvandoHospede}
                  modo={modoFormularioHospede}
                  onAtualizarCampo={atualizarCampoHospede}
                  onCadastrarHospede={cadastrarHospede}
                  onCancelar={fecharFormularioHospede}
                />
              )}

              {modoHospedes === 'detalhes' && hospedeSelecionado && (
                <div className="painel detalhes-hospede">
                  <div className="painel-cabecalho">
                    <div>
                      <h2>{hospedeSelecionado.nome}</h2>
                      <span>Dados completos do hospede selecionado.</span>
                    </div>
                    <button
                      type="button"
                      className="botao-secundario botao-com-icone"
                      onClick={fecharFormularioHospede}
                    >
                      <IconeAcao tipo="fechar" />
                      Fechar
                    </button>
                  </div>

                  <div className="dados-hospede">
                    <p>
                      <strong>CPF:</strong> {hospedeSelecionado.cpf}
                    </p>
                    <p>
                      <strong>Telefone:</strong> {hospedeSelecionado.telefone}
                    </p>
                    <p>
                      <strong>E-mail:</strong> {hospedeSelecionado.email}
                    </p>
                    <p>
                      <strong>Endereco:</strong>{' '}
                      {hospedeSelecionado.endereco || 'Nao informado'}
                    </p>
                    <p>
                      <strong>Observacoes:</strong>{' '}
                      {hospedeSelecionado.observacoes || 'Nenhuma observacao'}
                    </p>
                  </div>
                </div>
              )}

              {modoHospedes === 'lista' && (
                <ListaHospedes
                  hospedes={hospedes}
                  onVisualizar={visualizarHospede}
                  onEditar={editarHospede}
                  onExcluir={excluirHospede}
                />
              )}
            </>
          )}

          {paginaAtual === 'reservas' && (
            <>
              {modoReservas === 'lista' && (
                <ListaReservas
                  reservas={reservas}
                  onNovaReserva={abrirNovaReserva}
                  onExcluir={excluirReserva}
                  onVisualizarReserva={verHospedagemPeloPainel}
                />
              )}

              {modoReservas === 'formulario' && (
                <FormularioReserva
                  reserva={novaReserva}
                  quartos={quartos}
                  hospedes={hospedes}
                  salvandoReserva={salvandoReserva}
                  onAtualizarCampo={atualizarCampoReserva}
                  onAdicionarReserva={adicionarReserva}
                  onAbrirNovoHospede={abrirModalHospedeReserva}
                  onCancelar={voltarParaListaReservas}
                />
              )}

              {modoReservas === 'detalhes' && reservaSelecionada && (
                <DetalhesReserva
                  reserva={reservaSelecionada}
                  quartos={quartos}
                  hospedes={hospedes}
                  pagamentos={pagamentos.filter(
                    (pagamento) =>
                      Number(pagamento.id_reserva) ===
                      Number(reservaSelecionada.id_reserva),
                  )}
                  onAdicionarPagamento={abrirPagamento}
                  onAtualizarReserva={salvarAlteracoesReserva}
                  onCancelar={voltarParaListaReservas}
                  onCancelarReserva={cancelarReserva}
                  onExcluirPagamento={excluirPagamento}
                  onFinalizarCheckout={finalizarCheckout}
                  onReabrirReserva={reabrirReserva}
                  onVoltar={voltarParaListaReservas}
                />
              )}
            </>
          )}

          {paginaAtual === 'transacoes' && (
            <Transacoes
              reservas={reservas}
              pagamentos={pagamentos}
              onAdicionarPagamento={abrirPagamento}
            />
          )}
        </section>
      )}

      {reservaPagamento && pagamentoAtual && (
        <ModalPagamento
          reserva={reservaPagamento}
          pagamento={pagamentoAtual}
          onAtualizarCampo={atualizarCampoPagamento}
          onFechar={fecharPagamento}
          onSalvar={salvarPagamento}
        />
      )}

      {modalHospedeReservaAberto && (
        <ModalHospedeReserva
          hospede={hospedeRapido}
          salvando={salvandoHospedeRapido}
          onAtualizarCampo={atualizarCampoHospedeRapido}
          onFechar={fecharModalHospedeReserva}
          onSalvar={cadastrarHospedePelaReserva}
        />
      )}
    </main>
  )
}

export default PainelInicial
