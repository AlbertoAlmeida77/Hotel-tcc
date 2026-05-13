export const rotas = {
  painel: '/',
  quartos: '/quartos',
  hospedes: '/hospedes',
  reservas: '/reservas',
}

export function descobrirPaginaPelaUrl(caminho) {
  const rotaEncontrada = Object.entries(rotas).find(
    ([, caminhoRota]) => caminhoRota === caminho,
  )

  if (!rotaEncontrada) {
    return 'painel'
  }

  return rotaEncontrada[0]
}
