function ListaHospedes({ hospedes, onVisualizar, onEditar, onExcluir }) {
  return (
    <div className="painel">
      <div className="painel-cabecalho">
        <h2>Hospedes</h2>
        <span>{hospedes.length} cadastrados</span>
      </div>

      <div className="lista">
        {hospedes.length === 0 && (
          <p className="vazio">Nenhum hospede cadastrado ainda.</p>
        )}

        {hospedes.map((hospede) => (
          <article className="item" key={hospede.id_hospede}>
            <div>
              <strong>{hospede.nome}</strong>
              <p>{hospede.email}</p>
            </div>
            <div className="detalhes">
              <span>{hospede.cpf}</span>
              <span>{hospede.telefone}</span>
            </div>

            <div className="acoes-item">
              <button
                type="button"
                className="botao-secundario botao-pequeno"
                onClick={() => onVisualizar(hospede)}
              >
                Visualizar
              </button>
              <button
                type="button"
                className="botao-pequeno"
                onClick={() => onEditar(hospede)}
              >
                Editar
              </button>
              <button
                type="button"
                className="botao-excluir botao-pequeno"
                onClick={() => onExcluir(hospede)}
              >
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ListaHospedes
