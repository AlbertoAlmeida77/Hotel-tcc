import { useEffect, useState } from 'react'
import DashboardQuartos from '../components/DashboardQuartos'
import DetalhesReserva from '../components/DetalhesReserva'
import FormularioHospede from '../components/FormularioHospede'
import FormularioQuarto from '../components/FormularioQuarto'
import FormularioReserva from '../components/FormularioReserva'
import ListaHospedes from '../components/ListaHospedes'
import ListaQuartos from '../components/ListaQuartos'
import ListaReservas from '../components/ListaReservas'
import {
  atualizarStatusQuartoNoServidor,
  atualizarHospedeNoServidor,
  buscarDadosDoServidor,
  cadastrarHospedeNoServidor,
  cadastrarQuartoNoServidor,
  cadastrarReservaNoServidor,
} from '../services/api'

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
    descricao: 'Veja os quartos e hospedes cadastrados no banco de dados.',
  },
  quartos: {
    titulo: 'Quartos',
    descricao: 'Cadastre quartos e acompanhe a lista de quartos do hotel.',
  },
  hospedes: {
    titulo: 'Hospedes',
    descricao: 'Consulte os hospedes cadastrados no sistema.',
  },
  reservas: {
    titulo: 'Reservas',
    descricao: 'Area reservada para o controle de reservas do hotel.',
  },
}

function PainelInicial({ paginaAtual }) {
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
  const [novoHospede, setNovoHospede] = useState(hospedeVazio)
  const [novaReserva, setNovaReserva] = useState(reservaVazia)
  const [reservaSelecionada, setReservaSelecionada] = useState(null)
  const [modoReservas, setModoReservas] = useState('lista')
  const [hospedeSelecionado, setHospedeSelecionado] = useState(null)
  const [modoFormularioHospede, setModoFormularioHospede] =
    useState('cadastrar')
  const [mostrarFormularioHospede, setMostrarFormularioHospede] =
    useState(false)

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

      await cadastrarQuartoNoServidor(novoQuarto)

      mostrarMensagemQuarto('Quarto cadastrado com sucesso.')
      setNovoQuarto(quartoVazio)
      carregarDados()
    } catch (erroAtual) {
      setErro(erroAtual.message)
    } finally {
      setSalvandoQuarto(false)
    }
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
      setMostrarFormularioHospede(false)
      setHospedeSelecionado(null)
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
    setMostrarFormularioHospede(true)
  }

  function visualizarHospede(hospede) {
    setHospedeSelecionado(hospede)
    setMostrarFormularioHospede(false)
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
    setMostrarFormularioHospede(true)
  }

  function fecharFormularioHospede() {
    setNovoHospede(hospedeVazio)
    setModoFormularioHospede('cadastrar')
    setMostrarFormularioHospede(false)
  }

  async function alterarStatusQuarto(quarto, novoStatus) {
    const statusAnterior = quarto.status

    setQuartos((quartosAtuais) =>
      quartosAtuais.map((quartoAtual) =>
        quartoAtual.id_quarto === quarto.id_quarto
          ? { ...quartoAtual, status: novoStatus }
          : quartoAtual,
      ),
    )

    try {
      setErro('')
      await atualizarStatusQuartoNoServidor(quarto, novoStatus)
    } catch (erroAtual) {
      setQuartos((quartosAtuais) =>
        quartosAtuais.map((quartoAtual) =>
          quartoAtual.id_quarto === quarto.id_quarto
            ? { ...quartoAtual, status: statusAnterior }
            : quartoAtual,
        ),
      )
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
  }

  function voltarParaListaReservas() {
    setReservaSelecionada(null)
    setModoReservas('lista')
  }

  function concluirHospedagem() {
    const confirmou = window.confirm(
      'Deseja confirmar a hospedagem desta reserva?',
    )

    if (!confirmou) {
      return
    }

    setReservaSelecionada(null)
    setModoReservas('lista')
    mostrarMensagemQuarto('Hospedagem concluida.')
  }

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
      {carregando && <p className="aviso">Carregando dados...</p>}

      {!carregando && (
        <section className="conteudo">
          {paginaAtual === 'painel' && (
            <DashboardQuartos
              quartos={quartos}
              onAlterarStatus={alterarStatusQuarto}
            />
          )}

          {paginaAtual === 'quartos' && (
            <>
              <FormularioQuarto
                novoQuarto={novoQuarto}
                salvandoQuarto={salvandoQuarto}
                onAtualizarCampo={atualizarCampoQuarto}
                onCadastrarQuarto={cadastrarQuarto}
              />

              <ListaQuartos quartos={quartos} />
            </>
          )}

          {paginaAtual === 'hospedes' && (
            <>
              <div className="barra-acoes">
                <button
                  type="button"
                  onClick={abrirCadastroHospede}
                >
                  Novo hospede
                </button>
              </div>

              {mostrarFormularioHospede && (
                <FormularioHospede
                  novoHospede={novoHospede}
                  salvandoHospede={salvandoHospede}
                  modo={modoFormularioHospede}
                  onAtualizarCampo={atualizarCampoHospede}
                  onCadastrarHospede={cadastrarHospede}
                  onCancelar={fecharFormularioHospede}
                />
              )}

              {hospedeSelecionado && (
                <div className="painel detalhes-hospede">
                  <div className="painel-cabecalho">
                    <div>
                      <h2>{hospedeSelecionado.nome}</h2>
                      <span>Dados completos do hospede selecionado.</span>
                    </div>
                    <button
                      type="button"
                      className="botao-secundario"
                      onClick={() => setHospedeSelecionado(null)}
                    >
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

              <ListaHospedes
                hospedes={hospedes}
                onVisualizar={visualizarHospede}
                onEditar={editarHospede}
              />
            </>
          )}

          {paginaAtual === 'reservas' && (
            <>
              {modoReservas === 'lista' && (
                <ListaReservas
                  reservas={reservas}
                  onNovaReserva={abrirNovaReserva}
                  onVisualizarReserva={(reserva) => {
                    setReservaSelecionada(reserva)
                    setModoReservas('detalhes')
                  }}
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
                  onCancelar={voltarParaListaReservas}
                />
              )}

              {modoReservas === 'detalhes' && reservaSelecionada && (
                <DetalhesReserva
                  reserva={reservaSelecionada}
                  onCancelar={voltarParaListaReservas}
                  onHospedar={concluirHospedagem}
                  onVoltar={voltarParaListaReservas}
                />
              )}
            </>
          )}
        </section>
      )}
    </main>
  )
}

export default PainelInicial
