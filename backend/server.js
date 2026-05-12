const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor do Hotel TCC funcionando!");
});

app.get("/teste-banco", async (req, res) => {
    try {
        const [resultado] = await pool.query("SELECT 1 + 1 AS soma");
        res.json(resultado[0]);
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao conectar no banco",
            erro: erro.message
        });
    }
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});