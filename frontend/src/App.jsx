import { useEffect, useState } from 'react'
import Login from './components/Login'
import MenuLateral from './components/MenuLateral'
import ModalUsuarios from './components/ModalUsuarios'
import PainelInicial from './pages/PainelInicial'
import { descobrirPaginaPelaUrl, rotas } from './services/rotas'
import {
  cadastrarUsuarioGerado,
  excluirUsuarioGerado,
  listarUsuariosGerados,
  usuarioPodeGerenciarUsuarios,
} from './services/usuarios'
import './App.css'

const chaveSessao = 'hotel-api-usuario'

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const usuarioSalvo = localStorage.getItem(chaveSessao)

    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null
  })
  const [localizacaoAtual, setLocalizacaoAtual] = useState(() =>
    `${window.location.pathname}${window.location.search}`,
  )
  const [modalUsuariosAberto, setModalUsuariosAberto] = useState(false)
  const [usuariosGerados, setUsuariosGerados] = useState(() =>
    listarUsuariosGerados(),
  )
  const paginaAtual = descobrirPaginaPelaUrl(window.location.pathname)
  const podeGerenciarUsuarios = usuarioPodeGerenciarUsuarios(usuarioLogado)
  const podeVerTransacoes = podeGerenciarUsuarios
  const paginaPermitida =
    paginaAtual === 'transacoes' && !podeVerTransacoes ? 'painel' : paginaAtual
  const localizacaoPermitida =
    paginaAtual === 'transacoes' && !podeVerTransacoes
      ? rotas.painel
      : localizacaoAtual

  function navegarPara(pagina, parametros = {}) {
    if (pagina === 'transacoes' && !podeVerTransacoes) {
      window.history.pushState(null, '', rotas.painel)
      setLocalizacaoAtual(`${window.location.pathname}${window.location.search}`)
      return
    }

    const novaUrl = rotas[pagina]
    const busca = new URLSearchParams()

    Object.entries(parametros).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        busca.set(chave, valor)
      }
    })

    const urlCompleta = busca.toString()
      ? `${novaUrl}?${busca.toString()}`
      : novaUrl

    window.history.pushState(null, '', urlCompleta)
    setLocalizacaoAtual(`${window.location.pathname}${window.location.search}`)
  }

  function entrar(usuario) {
    localStorage.setItem(chaveSessao, JSON.stringify(usuario))
    setUsuarioLogado(usuario)
  }

  function sair() {
    localStorage.removeItem(chaveSessao)
    setUsuarioLogado(null)
    window.history.pushState(null, '', rotas.painel)
    setLocalizacaoAtual(`${window.location.pathname}${window.location.search}`)
  }

  function abrirGerenciamentoUsuarios() {
    if (!podeGerenciarUsuarios) {
      return
    }

    setUsuariosGerados(listarUsuariosGerados())
    setModalUsuariosAberto(true)
  }

  function criarUsuario(dadosUsuario) {
    cadastrarUsuarioGerado(dadosUsuario)
    setUsuariosGerados(listarUsuariosGerados())
  }

  function excluirUsuario(idUsuario) {
    excluirUsuarioGerado(idUsuario)
    setUsuariosGerados(listarUsuariosGerados())
  }

  useEffect(() => {
    function voltarOuAvancarNoNavegador() {
      setLocalizacaoAtual(`${window.location.pathname}${window.location.search}`)
    }

    window.addEventListener('popstate', voltarOuAvancarNoNavegador)

    return () => {
      window.removeEventListener('popstate', voltarOuAvancarNoNavegador)
    }
  }, [])

  useEffect(() => {
    if (usuarioLogado && paginaAtual === 'transacoes' && !podeVerTransacoes) {
      window.history.replaceState(null, '', rotas.painel)
    }
  }, [paginaAtual, podeVerTransacoes, usuarioLogado])

  if (!usuarioLogado) {
    return <Login onEntrar={entrar} />
  }

  return (
    <div className="layout">
      <MenuLateral
        paginaAtual={paginaPermitida}
        onGerenciarUsuarios={abrirGerenciamentoUsuarios}
        onMudarPagina={navegarPara}
        onSair={sair}
        podeGerenciarUsuarios={podeGerenciarUsuarios}
        podeVerTransacoes={podeVerTransacoes}
        usuario={usuarioLogado}
      />

      <PainelInicial
        paginaAtual={paginaPermitida}
        localizacaoAtual={localizacaoPermitida}
        onMudarPagina={navegarPara}
      />

      {modalUsuariosAberto && podeGerenciarUsuarios && (
        <ModalUsuarios
          usuarios={usuariosGerados}
          onCriarUsuario={criarUsuario}
          onExcluirUsuario={excluirUsuario}
          onFechar={() => setModalUsuariosAberto(false)}
        />
      )}
    </div>
  )
}

export default App
