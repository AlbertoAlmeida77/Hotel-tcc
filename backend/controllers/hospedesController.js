const pool = require("../config/db");

async function listarHospedes(req, res) {
    try {
        const [hospedes] = await pool.query("SELECT * FROM hospedes ORDER BY nome");
        res.json(hospedes);
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao listar hospedes",
            erro: erro.message
        });
    }
}

async function cadastrarHospede(req, res) {
    try {
        const { nome, cpf, telefone, email, endereco, observacoes } = req.body;

        if (!nome || !cpf || !telefone || !email) {
            return res.status(400).json({
                mensagem: "Preencha os campos obrigatorios: nome, cpf, telefone e email"
            });
        }

        const sql = `
            INSERT INTO hospedes
                (nome, cpf, telefone, email, endereco, observacoes)
            VALUES
                (?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            nome,
            cpf,
            telefone,
            email,
            endereco || null,
            observacoes || null
        ];

        const [resultado] = await pool.query(sql, valores);

        res.status(201).json({
            mensagem: "Hospede cadastrado com sucesso",
            id_hospede: resultado.insertId
        });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao cadastrar hospede",
            erro: erro.message
        });
    }
}

async function buscarHospedePorId(req, res) {
    try {
        const { id } = req.params;

        const [hospedes] = await pool.query(
            "SELECT * FROM hospedes WHERE id_hospede = ?",
            [id]
        );

        if (hospedes.length === 0) {
            return res.status(404).json({
                mensagem: "Hospede nao encontrado"
            });
        }

        res.json(hospedes[0]);
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao buscar hospede",
            erro: erro.message
        });
    }
}

async function atualizarHospede(req, res) {
    try {
        const { id } = req.params;
        const { nome, cpf, telefone, email, endereco, observacoes } = req.body;

        if (!nome || !cpf || !telefone || !email) {
            return res.status(400).json({
                mensagem: "Preencha os campos obrigatorios: nome, cpf, telefone e email"
            });
        }

        const sql = `
            UPDATE hospedes
            SET
                nome = ?,
                cpf = ?,
                telefone = ?,
                email = ?,
                endereco = ?,
                observacoes = ?
            WHERE id_hospede = ?
        `;

        const valores = [
            nome,
            cpf,
            telefone,
            email,
            endereco || null,
            observacoes || null,
            id
        ];

        const [resultado] = await pool.query(sql, valores);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Hospede nao encontrado"
            });
        }

        res.json({
            mensagem: "Hospede atualizado com sucesso"
        });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao atualizar hospede",
            erro: erro.message
        });
    }
}

async function excluirHospede(req, res) {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            "DELETE FROM hospedes WHERE id_hospede = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Hospede nao encontrado"
            });
        }

        res.json({
            mensagem: "Hospede excluido com sucesso"
        });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao excluir hospede",
            erro: erro.message
        });
    }
}

module.exports = {
    listarHospedes,
    cadastrarHospede,
    buscarHospedePorId,
    atualizarHospede,
    excluirHospede
};
