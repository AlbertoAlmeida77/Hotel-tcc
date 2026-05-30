import { useState } from 'react'
import logoHotelDestaque from '../assets/logo-hotel-destaque.png'
import { autenticarUsuario } from '../services/usuarios'

function IconeLogin({ tipo }) {
  const icones = {
    usuario: (
      <>
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    senha: (
      <>
        <path d="M7 11V8a5 5 0 0 1 10 0v3" />
        <path d="M6 11h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
      </>
    ),
    entrar: (
      <>
        <path d="M14 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
        <path d="m10 17 5-5-5-5" />
        <path d="M15 12H4" />
      </>
    ),
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {icones[tipo]}
    </svg>
  )
}

function Login({ onEntrar }) {
  const [credenciais, setCredenciais] = useState({
    usuario: '',
    senha: '',
  })
  const [erro, setErro] = useState('')

  function atualizarCampo(evento) {
    const { name, value } = evento.target

    setCredenciais((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: value,
    }))
  }

  function entrar(evento) {
    evento.preventDefault()

    const usuario = credenciais.usuario.trim()
    const senha = credenciais.senha.trim()

    if (!usuario || !senha) {
      setErro('Informe usuario e senha para entrar.')
      return
    }

    const usuarioAutenticado = autenticarUsuario(usuario, senha)

    if (!usuarioAutenticado) {
      setErro('Usuario ou senha incorretos.')
      return
    }

    setErro('')
    onEntrar(usuarioAutenticado)
  }

  return (
    <main className="login-page">
      <section className="login-painel" aria-label="Acesso ao sistema">
        <div className="login-marca">
          <img src={logoHotelDestaque} alt="" />
          <span>Hotel Auto Posto Itaguari</span>
        </div>

        <div className="login-cabecalho">
          <span className="etiqueta">Acesso seguro</span>
          <h1>Entrar no sistema</h1>
          <p>Use suas credenciais de gestor para acessar o painel.</p>
        </div>

        <form className="login-formulario" onSubmit={entrar}>
          <label>
            Usuario
            <span className="login-campo">
              <IconeLogin tipo="usuario" />
              <input
                autoComplete="username"
                name="usuario"
                onChange={atualizarCampo}
                placeholder="Digite seu usuario"
                type="text"
                value={credenciais.usuario}
              />
            </span>
          </label>

          <label>
            Senha
            <span className="login-campo">
              <IconeLogin tipo="senha" />
              <input
                autoComplete="current-password"
                name="senha"
                onChange={atualizarCampo}
                placeholder="Digite sua senha"
                type="password"
                value={credenciais.senha}
              />
            </span>
          </label>

          {erro && <p className="aviso erro">{erro}</p>}

          <button className="botao-login" type="submit">
            <IconeLogin tipo="entrar" />
            Entrar
          </button>
        </form>
      </section>

      <aside className="login-destaque" aria-hidden="true">
        <div className="login-destaque-conteudo">
          <span className="login-destaque-etiqueta">Painel inteligente</span>
          <strong>Gestao hoteleira</strong>
          <span>Quartos, reservas, hospedes e financeiro em um unico painel.</span>
        </div>

        <div className="login-dashboard-preview">
          <div className="login-metrica login-metrica-grande">
            <span>Ocupacao</span>
            <strong>78%</strong>
            <div className="login-barra">
              <i style={{ width: '78%' }} />
            </div>
          </div>

          <div className="login-metrica">
            <span>Quartos disponiveis</span>
            <strong>15</strong>
          </div>

          <div className="login-metrica">
            <span>Reservas de hoje</span>
            <strong>28</strong>
          </div>

          <div className="login-metrica">
            <span>Hospedes hospedados</span>
            <strong>42</strong>
          </div>

          <div className="login-metrica login-metrica-receita">
            <span>Receita do dia</span>
            <strong>R$ 7.680,00</strong>
          </div>

          <div className="login-card-flutuante">
            <span>Check-ins</span>
            <strong>12 previstos</strong>
          </div>
        </div>
      </aside>
    </main>
  )
}

export default Login
