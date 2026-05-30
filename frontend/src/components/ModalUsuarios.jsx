import { useEffect, useState } from 'react'
import { gerarSenhaTemporaria } from '../services/usuarios'

function IconeLixeira() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6 18 20H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

function ModalUsuarios({ usuarios, onCriarUsuario, onExcluirUsuario, onFechar }) {
  const [formulario, setFormulario] = useState(() => ({
    nome: '',
    senha: gerarSenhaTemporaria(),
  }))
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (!mensagem) {
      return undefined
    }

    const timeout = setTimeout(() => {
      setMensagem('')
    }, 3000)

    return () => clearTimeout(timeout)
  }, [mensagem])

  function atualizarCampo(evento) {
    const { name, value } = evento.target

    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: value,
    }))
  }

  function gerarNovaSenha() {
    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      senha: gerarSenhaTemporaria(),
    }))
    setMensagem('')
    setErro('')
  }

  function criarUsuario(evento) {
    evento.preventDefault()

    try {
      onCriarUsuario(formulario)
      setMensagem(`Usuario ${formulario.nome.trim()} criado com sucesso.`)
      setErro('')
      setFormulario({
        nome: '',
        senha: gerarSenhaTemporaria(),
      })
    } catch (erroAtual) {
      setMensagem('')
      setErro(erroAtual.message)
    }
  }

  function excluirUsuario(usuario) {
    const confirmou = window.confirm(`Excluir o usuario ${usuario.nome}?`)

    if (!confirmou) {
      return
    }

    onExcluirUsuario(usuario.id)
    setMensagem('')
    setErro('')
  }

  return (
    <div className="modal-fundo">
      <section className="modal-pagamento modal-usuarios">
        <div className="modal-cabecalho">
          <div>
            <h2>Gerenciar usuarios</h2>
            <span>Crie acessos para a equipe entrar no sistema.</span>
          </div>
          <button type="button" className="botao-secundario" onClick={onFechar}>
            Fechar
          </button>
        </div>

        <form className="formulario-usuarios" onSubmit={criarUsuario}>
          <label>
            Usuario
            <input
              autoComplete="off"
              name="nome"
              onChange={atualizarCampo}
              placeholder="Ex: recepcao"
              type="text"
              value={formulario.nome}
            />
          </label>

          <label>
            Senha gerada
            <div className="campo-com-botao">
              <input
                autoComplete="new-password"
                name="senha"
                onChange={atualizarCampo}
                type="text"
                value={formulario.senha}
              />
              <button type="button" onClick={gerarNovaSenha}>
                Gerar
              </button>
            </div>
          </label>

          {erro && <p className="aviso erro">{erro}</p>}
          {mensagem && <p className="aviso sucesso">{mensagem}</p>}

          <div className="modal-rodape">
            <button type="button" className="botao-secundario" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit">Criar usuario</button>
          </div>
        </form>

        <div className="usuarios-criados">
          <strong>Usuarios criados</strong>
          {usuarios.length === 0 && <p>Nenhum usuario adicional criado.</p>}
          {usuarios.map((usuario) => (
            <div className="usuario-criado" key={usuario.id}>
              <span>{usuario.nome}</span>
              <code>{usuario.senha}</code>
              <button
                type="button"
                className="botao-excluir-usuario"
                aria-label={`Excluir usuario ${usuario.nome}`}
                title="Excluir usuario"
                onClick={() => excluirUsuario(usuario)}
              >
                <IconeLixeira />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ModalUsuarios
