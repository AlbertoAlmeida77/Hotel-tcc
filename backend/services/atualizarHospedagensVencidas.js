async function atualizarHospedagensVencidas(pool) {
    await pool.query(`
        UPDATE reservas
        SET
            situacao = 'finalizado',
            finalizada_em = COALESCE(finalizada_em, NOW())
        WHERE situacao = 'hospedar'
          AND data_saida IS NOT NULL
          AND TIMESTAMP(data_saida, '12:00:00') <= NOW()
    `);

    await pool.query(`
        UPDATE quartos
        SET status = 'disponivel'
        WHERE LOWER(status) = 'ocupado'
          AND id_quarto NOT IN (
              SELECT id_quarto FROM reservas
              WHERE situacao = 'hospedar'
                AND data_entrada <= CURDATE()
                AND TIMESTAMP(data_saida, '12:00:00') > NOW()
          )
    `);
}

module.exports = atualizarHospedagensVencidas;
