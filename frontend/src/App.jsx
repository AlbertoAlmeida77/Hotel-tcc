import { useEffect, useState } from 'react'
import MenuLateral from './components/MenuLateral'
import PainelInicial from './pages/PainelInicial'
import { descobrirPaginaPelaUrl, rotas } from './services/rotas'
import './App.css'

function App() {
  const [paginaAtual, setPaginaAtual] = useState(() =>
    descobrirPaginaPelaUrl(window.location.pathname),
  )

  function navegarPara(pagina) {
    const novaUrl = rotas[pagina]

    window.history.pushState(null, '', novaUrl)
    setPaginaAtual(pagina)
  }

  useEffect(() => {
    function voltarOuAvancarNoNavegador() {
      setPaginaAtual(descobrirPaginaPelaUrl(window.location.pathname))
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

      <PainelInicial paginaAtual={paginaAtual} />
    </div>
  )
}

export default App
