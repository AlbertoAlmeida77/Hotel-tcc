import { useMemo, useState } from 'react'

function IconeBusca() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function IconeFiltro() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 5h16" />
      <path d="M7 12h10" />
      <path d="M10 19h4" />
    </svg>
  )
}

function IconeUsuario() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

function IconeCheck() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function obterCidade(endereco) {
  if (!endereco) {
    return '-'
  }

  const partes = String(endereco)
    .split(',')
    .map((parte) => parte.trim())
    .filter(Boolean)

  return partes.at(-1) || '-'
}

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function ListaHospedes({
  hospedes,
  onNovoHospede,
  onEditar,
}) {
  const [busca, setBusca] = useState('')
  const termoBusca = normalizarTexto(busca)
  const hospedesFiltrados = useMemo(
    () =>
      hospedes.filter((hospede) => {
        const conteudo = normalizarTexto(
          [
            hospede.nome,
            hospede.email,
            hospede.cpf,
            hospede.telefone,
            hospede.endereco,
          ].join(' '),
        )

        return conteudo.includes(termoBusca)
      }),
    [hospedes, termoBusca],
  )

  return (
    <section className="hospedes-listagem">
      <div className="hospedes-breadcrumb">
        <span>Home</span>
        <strong>/ Hóspedes</strong>
      </div>

      <div className="hospedes-toolbar">
        <label className="campo-busca-hospedes">
          <span>
            <IconeBusca />
          </span>
          <input
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Pesquise por CPF, nome ou e-mail"
          />
        </label>

        <button
          type="button"
          className="botao-filtro-hospedes"
          title="Filtrar hóspedes"
          aria-label="Filtrar hóspedes"
        >
          <IconeFiltro />
        </button>

        <button
          type="button"
          className="botao-novo-hospede"
          onClick={onNovoHospede}
        >
          + Novo hóspede
        </button>
      </div>

      <div className="painel painel-hospedes-tabela">
        <div className="painel-cabecalho hospedes-cabecalho">
          <div>
            <h2>Lista de hóspedes</h2>
            <span className="hospedes-total">
              <IconeUsuario />
              {hospedesFiltrados.length}
            </span>
          </div>
        </div>

        <div className="tabela-hospedes-wrap">
          <table className="tabela-hospedes">
            <thead>
              <tr>
                <th>Ativo?</th>
                <th>Nome completo</th>
                <th>E-mail</th>
                <th>Fone</th>
                <th>Cidade</th>
              </tr>
            </thead>
            <tbody>
              {hospedesFiltrados.length === 0 && (
                <tr className="tabela-vazia">
                  <td colSpan="5">Nenhum hóspede encontrado.</td>
                </tr>
              )}

              {hospedesFiltrados.map((hospede) => (
                <tr key={hospede.id_hospede}>
                  <td>
                    <span className="status-hospede-ativo">
                      <IconeCheck />
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="link-hospede"
                      onClick={() => onEditar(hospede)}
                    >
                      {hospede.nome}
                    </button>
                  </td>
                  <td>{hospede.email || '-'}</td>
                  <td>{hospede.telefone || '-'}</td>
                  <td>{obterCidade(hospede.endereco)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default ListaHospedes
