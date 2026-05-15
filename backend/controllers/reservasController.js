const pool = require("../config/db");

const selectReservas = `
    SELECT
        reservas.*,
        hospedes.nome AS nome_hospede,
        hospedes.cpf  AS cpf_hospede,
        quartos.numero AS numero_quarto,
        quartos.tipo   AS tipo_quarto
    FROM reservas
    INNER JOIN hospedes ON hospedes.id_hospede = reservas.id_hospede
    INNER JOIN quartos  ON quartos.id_quarto   = reservas.id_quarto
`;

async function listarReservas(req, res) {
    try {
        const { situacao, data_entrada_de, data_entrada_ate, incluir_historico } = req.query;
        const condicoes = [];
        const valores   = [];
        const deveIncluirHistorico = String(incluir_historico || "").toLowerCase() === "true";

        if (situacao) {
            condicoes.push("reservas.situacao = ?");
            valores.push(situacao);
        }
        if (data_entrada_de) {
            condicoes.push("reservas.data_entrada >= ?");
            valores.push(data_entrada_de);
        }
        if (data_entrada_ate) {
            condicoes.push("reservas.data_entrada <= ?");
            valores.push(data_entrada_ate);
        }
        if (!deveIncluirHistorico && !situacao) {
            condicoes.push(`
                (
                    reservas.situacao NOT IN ('finalizado', 'finalizada')
                    OR reservas.finalizada_em IS NULL
                    OR reservas.finalizada_em >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                )
            `);
        }

        const where = condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "";

        const [reservas] = await pool.query(`
            ${selectReservas}
            ${where}
            ORDER BY reservas.data_entrada DESC, reservas.id_reserva DESC
        `, valores);

        res.json(reservas);
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao listar reservas",
            erro: erro.message
        });
    }
}

async function cadastrarReserva(req, res) {
    try {
        const {
            id_hospede, id_quarto, situacao,
            data_entrada, data_saida, valor_diaria,
            cafe_manha, adultos, criancas, observacao
        } = req.body;

        if (!id_hospede || !id_quarto || !situacao || !data_entrada || !data_saida
            || valor_diaria === undefined || valor_diaria === null || valor_diaria === "") {
            return res.status(400).json({
                mensagem: "Preencha os campos obrigatorios: hospede, quarto, situacao, data_entrada, data_saida e valor_diaria"
            });
        }

        // Verificar conflito de datas para o mesmo quarto
        const [conflitos] = await pool.query(`
            SELECT id_reserva FROM reservas
            WHERE id_quarto = ?
              AND situacao NOT IN ('cancelado', 'cancelada', 'finalizado', 'finalizada')
              AND data_entrada < ?
              AND data_saida   > ?
        `, [id_quarto, data_saida, data_entrada]);

        if (conflitos.length > 0) {
            return res.status(409).json({
                mensagem: "Quarto ja reservado para o periodo informado"
            });
        }

        const sql = `
            INSERT INTO reservas
                (id_hospede, id_quarto, situacao, data_entrada, data_saida,
                 valor_diaria, cafe_manha, adultos, criancas, observacao)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            id_hospede, id_quarto, situacao, data_entrada, data_saida,
            valor_diaria,
            cafe_manha ? 1 : 0,
            adultos    || 1,
            criancas   || 0,
            observacao || null
        ];

        const [resultado] = await pool.query(sql, valores);

        res.status(201).json({
            mensagem: "Reserva cadastrada com sucesso",
            id_reserva: resultado.insertId
        });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao cadastrar reserva",
            erro: erro.message
        });
    }
}

async function buscarReservaPorId(req, res) {
    try {
        const { id } = req.params;

        const [reservas] = await pool.query(
            `${selectReservas} WHERE reservas.id_reserva = ?`,
            [id]
        );

        if (reservas.length === 0) {
            return res.status(404).json({ mensagem: "Reserva nao encontrada" });
        }

        res.json(reservas[0]);
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao buscar reserva",
            erro: erro.message
        });
    }
}

async function atualizarReserva(req, res) {
    try {
        const { id } = req.params;
        const {
            id_hospede, id_quarto, situacao,
            data_entrada, data_saida, valor_diaria,
            cafe_manha, adultos, criancas, observacao
        } = req.body;

        if (!id_hospede || !id_quarto || !situacao || !data_entrada || !data_saida
            || valor_diaria === undefined || valor_diaria === null || valor_diaria === "") {
            return res.status(400).json({
                mensagem: "Preencha os campos obrigatorios: hospede, quarto, situacao, data_entrada, data_saida e valor_diaria"
            });
        }

        const [reservasAtuais] = await pool.query(
            "SELECT situacao, finalizada_em FROM reservas WHERE id_reserva = ?",
            [id]
        );

        if (reservasAtuais.length === 0) {
            return res.status(404).json({ mensagem: "Reserva nao encontrada" });
        }

        const situacaoAnterior = reservasAtuais[0].situacao;
        const finalizadaEmAnterior = reservasAtuais[0].finalizada_em;
        const reservaFoiFinalizada = ["finalizado", "finalizada"].includes(situacao);
        const reservaJaEstavaFinalizada = ["finalizado", "finalizada"].includes(situacaoAnterior);
        const finalizadaEm = reservaFoiFinalizada
            ? (reservaJaEstavaFinalizada && finalizadaEmAnterior ? finalizadaEmAnterior : new Date())
            : null;

        const sql = `
            UPDATE reservas
            SET
                id_hospede   = ?,
                id_quarto    = ?,
                situacao     = ?,
                data_entrada = ?,
                data_saida   = ?,
                valor_diaria = ?,
                cafe_manha   = ?,
                adultos      = ?,
                criancas     = ?,
                observacao   = ?,
                finalizada_em = ?
            WHERE id_reserva = ?
        `;

        const valores = [
            id_hospede, id_quarto, situacao,
            String(data_entrada).slice(0, 10),
            String(data_saida).slice(0, 10),
            valor_diaria,
            cafe_manha ? 1 : 0,
            adultos   || 1,
            criancas  || 0,
            observacao || null,
            finalizadaEm,
            id
        ];

        const [resultado] = await pool.query(sql, valores);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Reserva nao encontrada" });
        }

        res.json({ mensagem: "Reserva atualizada com sucesso" });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao atualizar reserva",
            erro: erro.message
        });
    }
}

async function atualizarSituacaoReserva(req, res) {
    try {
        const { id } = req.params;
        const { situacao } = req.body;

        const situacoesValidas = [
            "pendente", "ativa", "finalizada", "cancelada",
            "pre-reservar", "reservar", "hospedar", "em limpeza",
            "finalizado", "no show", "cancelado", "bloquear datas"
        ];

        if (!situacao || !situacoesValidas.includes(situacao)) {
            return res.status(400).json({
                mensagem: `Situacao invalida. Use: ${situacoesValidas.join(", ")}`
            });
        }

        const reservaFoiFinalizada = ["finalizado", "finalizada"].includes(situacao);

        const [resultado] = await pool.query(
            `
                UPDATE reservas
                SET
                    situacao = ?,
                    finalizada_em = CASE
                        WHEN ? THEN COALESCE(finalizada_em, NOW())
                        ELSE NULL
                    END
                WHERE id_reserva = ?
            `,
            [situacao, reservaFoiFinalizada, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Reserva nao encontrada" });
        }

        res.json({ mensagem: "Situacao da reserva atualizada com sucesso" });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao atualizar situacao da reserva",
            erro: erro.message
        });
    }
}

async function excluirReserva(req, res) {
    try {
        const { id } = req.params;

        const [reservas] = await pool.query(
            "SELECT situacao FROM reservas WHERE id_reserva = ?",
            [id]
        );

        if (reservas.length === 0) {
            return res.status(404).json({ mensagem: "Reserva nao encontrada" });
        }

        if (["finalizado", "finalizada"].includes(reservas[0].situacao)) {
            return res.status(409).json({
                mensagem: "Reservas finalizadas nao sao excluidas do banco; use os filtros de historico para consulta."
            });
        }

        const [resultado] = await pool.query(
            "DELETE FROM reservas WHERE id_reserva = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Reserva nao encontrada" });
        }

        res.json({ mensagem: "Reserva excluida com sucesso" });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao excluir reserva",
            erro: erro.message
        });
    }
}

module.exports = {
    listarReservas,
    cadastrarReserva,
    buscarReservaPorId,
    atualizarReserva,
    atualizarSituacaoReserva,
    excluirReserva
};
