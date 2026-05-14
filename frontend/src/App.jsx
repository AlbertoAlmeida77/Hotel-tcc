import { useEffect, useState } from 'react'
import MenuLateral from './components/MenuLateral'
import PainelInicial from './pages/PainelInicial'
import { descobrirPaginaPelaUrl, rotas } from './services/rotas'
import './App.css'

function App() {
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

  useEffect(() => {
    function voltarOuAvancarNoNavegador() {
      setLocalizacaoAtual(`${window.location.pathname}${window.location.search}`)
    }

    window.addEventListener('popstate', voltarOuAvancarNoNavegador)

    return () => {
      window.removeEventListener('popstate', voltarOuAvancarNoNavegador)
    }
  }, [])

  return (
    <div className="layout">
      <MenuLateral
        paginaAtual={paginaAtual}
        onMudarPagina={navegarPara}
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
