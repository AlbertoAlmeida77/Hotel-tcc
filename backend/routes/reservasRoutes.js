const express = require("express");
const router = express.Router();
const reservasController = require("../controllers/reservasController");

router.get("/", reservasController.listarReservas);
router.post("/", reservasController.cadastrarReserva);
router.get("/:id", reservasController.buscarReservaPorId);
router.put("/:id", reservasController.atualizarReserva);
router.patch("/:id/situacao", reservasController.atualizarSituacaoReserva);
router.delete("/:id", reservasController.excluirReserva);

module.exports = router;
