import { useEffect, useState } from 'react'
import Login from './components/Login'
import MenuLateral from './components/MenuLateral'
import PainelInicial from './pages/PainelInicial'
import { descobrirPaginaPelaUrl, rotas } from './services/rotas'
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
  const paginaAtual = descobrirPaginaPelaUrl(window.location.pathname)

  function navegarPara(pagina, parametros = {}) {
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

  useEffect(() => {
    function voltarOuAvancarNoNavegador() {
      setLocalizacaoAtual(`${window.location.pathname}${window.location.search}`)
    }

    window.addEventListener('popstate', voltarOuAvancarNoNavegador)

    return () => {
      window.removeEventListener('popstate', voltarOuAvancarNoNavegador)
    }
  }, [])

  if (!usuarioLogado) {
    return <Login onEntrar={entrar} />
  }

  return (
    <div className="layout">
      <MenuLateral
        paginaAtual={paginaAtual}
        onMudarPagina={navegarPara}
        onSair={sair}
        usuario={usuarioLogado}
      />

      <PainelInicial
        paginaAtual={paginaAtual}
        localizacaoAtual={localizacaoAtual}
        onMudarPagina={navegarPara}
      />
    </div>
  )
}

export default App
