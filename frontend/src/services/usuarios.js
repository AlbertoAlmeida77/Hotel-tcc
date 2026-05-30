const chaveUsuariosGerados = 'hotel-api-usuarios-gerados'
const usuarioAdmin = import.meta.env.VITE_LOGIN_USUARIO || 'admin'
const senhaAdmin = import.meta.env.VITE_LOGIN_SENHA || 'admin123'

export function listarUsuariosGerados() {
  const usuariosSalvos = localStorage.getItem(chaveUsuariosGerados)

  if (!usuariosSalvos) {
    return []
  }

  try {
    return JSON.parse(usuariosSalvos)
  } catch {
    return []
  }
}

function salvarUsuariosGerados(usuarios) {
  localStorage.setItem(chaveUsuariosGerados, JSON.stringify(usuarios))
}

export function autenticarUsuario(nome, senha) {
  const nomeTratado = String(nome || '').trim()
  const senhaTratada = String(senha || '').trim()

  if (nomeTratado === usuarioAdmin && senhaTratada === senhaAdmin) {
    return {
      nome: nomeTratado,
      administrador: true,
    }
  }

  const usuarioGerado = listarUsuariosGerados().find(
    (usuario) =>
      usuario.ativo &&
      usuario.nome === nomeTratado &&
      usuario.senha === senhaTratada,
  )

  if (!usuarioGerado) {
    return null
  }

  return {
    nome: usuarioGerado.nome,
    administrador: false,
  }
}

export function usuarioPodeGerenciarUsuarios(usuario) {
  return Boolean(usuario?.administrador || usuario?.nome === usuarioAdmin)
}

export function gerarSenhaTemporaria(tamanho = 10) {
  const caracteres =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$#'
  const valores = crypto.getRandomValues(new Uint32Array(tamanho))

  return Array.from(valores, (valor) => caracteres[valor % caracteres.length]).join(
    '',
  )
}

export function cadastrarUsuarioGerado({ nome, senha }) {
  const nomeTratado = String(nome || '').trim()
  const senhaTratada = String(senha || '').trim()

  if (!nomeTratado || !senhaTratada) {
    throw new Error('Informe usuario e senha para criar o acesso.')
  }

  if (nomeTratado === usuarioAdmin) {
    throw new Error('Esse usuario ja e o administrador principal.')
  }

  const usuarios = listarUsuariosGerados()
  const usuarioExistente = usuarios.some(
    (usuario) => usuario.nome.toLowerCase() === nomeTratado.toLowerCase(),
  )

  if (usuarioExistente) {
    throw new Error('Ja existe um usuario com esse nome.')
  }

  const usuarioCriado = {
    id: crypto.randomUUID(),
    nome: nomeTratado,
    senha: senhaTratada,
    ativo: true,
    criado_em: new Date().toISOString(),
  }

  salvarUsuariosGerados([usuarioCriado, ...usuarios])

  return usuarioCriado
}

export function excluirUsuarioGerado(idUsuario) {
  const usuarios = listarUsuariosGerados()
  const usuariosAtualizados = usuarios.filter(
    (usuario) => String(usuario.id) !== String(idUsuario),
  )

  salvarUsuariosGerados(usuariosAtualizados)
}
