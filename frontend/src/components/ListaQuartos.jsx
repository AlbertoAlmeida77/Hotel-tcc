function ListaQuartos({ quartos }) {
  return (
    <div className="painel">
      <div className="painel-cabecalho">
        <h2>Quartos</h2>
        <span>{quartos.length} cadastrados</span>
      </div>

      <div className="lista">
        {quartos.length === 0 && (
          <p className="vazio">Nenhum quarto cadastrado ainda.</p>
        )}

        {quartos.map((quarto) => (
          <article className="item" key={quarto.id_quarto}>
            <div>
              <strong>Quarto {quarto.numero}</strong>
              <p>{quarto.tipo}</p>
            </div>
            <div className="detalhes">
              <span>{quarto.capacidade} pessoa(s)</span>
              <span>R$ {Number(quarto.valor_diaria).toFixed(2)}</span>
              <span className="status">{quarto.status}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ListaQuartos
