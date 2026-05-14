const pool = require("../config/db");

async function listarQuartos(req, res) {
    try {
        const { status } = req.query;
        let sql = "SELECT * FROM quartos";
        const valores = [];

        if (status) {
            sql += " WHERE status = ?";
            valores.push(status);
        }

        sql += " ORDER BY numero";

        const [quartos] = await pool.query(sql, valores);
        res.json(quartos);
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao listar quartos",
            erro: erro.message
        });
    }
}

async function listarQuartosDisponiveis(req, res) {
    try {
        const { data_entrada, data_saida } = req.query;

        if (!data_entrada || !data_saida) {
            return res.status(400).json({
                mensagem: "Informe data_entrada e data_saida para verificar disponibilidade"
            });
        }

        const sql = `
            SELECT * FROM quartos
            WHERE status != 'manutencao'
            AND id_quarto NOT IN (
                SELECT id_quarto FROM reservas
                WHERE situacao NOT IN ('cancelada', 'finalizada')
                AND data_entrada < ?
                AND data_saida   > ?
            )
            ORDER BY numero
        `;

        const [quartos] = await pool.query(sql, [data_saida, data_entrada]);
        res.json(quartos);
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao buscar quartos disponiveis",
            erro: erro.message
        });
    }
}

async function cadastrarQuarto(req, res) {
    try {
        const { numero, tipo, capacidade, valor_diaria, status, descricao } = req.body;

        if (!numero || !tipo || !capacidade || !valor_diaria || !status) {
            return res.status(400).json({
                mensagem: "Preencha os campos obrigatorios: numero, tipo, capacidade, valor_diaria e status"
            });
        }

        const sql = `
            INSERT INTO quartos
                (numero, tipo, capacidade, valor_diaria, status, descricao)
            VALUES
                (?, ?, ?, ?, ?, ?)
        `;

        const valores = [numero, tipo, capacidade, valor_diaria, status, descricao || null];

        const [resultado] = await pool.query(sql, valores);

        res.status(201).json({
            mensagem: "Quarto cadastrado com sucesso",
            id_quarto: resultado.insertId
        });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao cadastrar quarto",
            erro: erro.message
        });
    }
}

async function buscarQuartoPorId(req, res) {
    try {
        const { id } = req.params;

        const [quartos] = await pool.query(
            "SELECT * FROM quartos WHERE id_quarto = ?",
            [id]
        );

        if (quartos.length === 0) {
            return res.status(404).json({ mensagem: "Quarto nao encontrado" });
        }

        res.json(quartos[0]);
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao buscar quarto",
            erro: erro.message
        });
    }
}

async function atualizarQuarto(req, res) {
    try {
        const { id } = req.params;
        const { numero, tipo, capacidade, valor_diaria, status, descricao } = req.body;

        if (!numero || !tipo || !capacidade || !valor_diaria || !status) {
            return res.status(400).json({
                mensagem: "Preencha os campos obrigatorios: numero, tipo, capacidade, valor_diaria e status"
            });
        }

        const sql = `
            UPDATE quartos
            SET
                numero      = ?,
                tipo        = ?,
                capacidade  = ?,
                valor_diaria = ?,
                status      = ?,
                descricao   = ?
            WHERE id_quarto = ?
        `;

        const valores = [numero, tipo, capacidade, valor_diaria, status, descricao || null, id];

        const [resultado] = await pool.query(sql, valores);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Quarto nao encontrado" });
        }

        res.json({ mensagem: "Quarto atualizado com sucesso" });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao atualizar quarto",
            erro: erro.message
        });
    }
}

async function atualizarStatusQuarto(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const statusValidos = ["disponivel", "ocupado", "manutencao"];

        if (!status || !statusValidos.includes(status)) {
            return res.status(400).json({
                mensagem: `Status invalido. Use: ${statusValidos.join(", ")}`
            });
        }

        const [resultado] = await pool.query(
            "UPDATE quartos SET status = ? WHERE id_quarto = ?",
            [status, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Quarto nao encontrado" });
        }

        res.json({ mensagem: "Status do quarto atualizado com sucesso" });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao atualizar status do quarto",
            erro: erro.message
        });
    }
}

async function excluirQuarto(req, res) {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            "DELETE FROM quartos WHERE id_quarto = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Quarto nao encontrado" });
        }

        res.json({ mensagem: "Quarto excluido com sucesso" });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao excluir quarto",
            erro: erro.message
        });
    }
}

module.exports = {
    listarQuartos,
    listarQuartosDisponiveis,
    cadastrarQuarto,
    buscarQuartoPorId,
    atualizarQuarto,
    atualizarStatusQuarto,
    excluirQuarto
};
