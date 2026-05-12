const pool = require("../config/db");

async function listarQuartos(req, res) {
    try {
        const [quartos] = await pool.query("SELECT * FROM quartos ORDER BY numero");
        res.json(quartos);
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao listar quartos",
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

        const valores = [
            numero,
            tipo,
            capacidade,
            valor_diaria,
            status,
            descricao || null
        ];

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
            return res.status(404).json({
                mensagem: "Quarto nao encontrado"
            });
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
                numero = ?,
                tipo = ?,
                capacidade = ?,
                valor_diaria = ?,
                status = ?,
                descricao = ?
            WHERE id_quarto = ?
        `;

        const valores = [
            numero,
            tipo,
            capacidade,
            valor_diaria,
            status,
            descricao || null,
            id
        ];

        const [resultado] = await pool.query(sql, valores);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Quarto nao encontrado"
            });
        }

        res.json({
            mensagem: "Quarto atualizado com sucesso"
        });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao atualizar quarto",
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
            return res.status(404).json({
                mensagem: "Quarto nao encontrado"
            });
        }

        res.json({
            mensagem: "Quarto excluido com sucesso"
        });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao excluir quarto",
            erro: erro.message
        });
    }
}

module.exports = {
    listarQuartos,
    cadastrarQuarto,
    buscarQuartoPorId,
    atualizarQuarto,
    excluirQuarto
};
