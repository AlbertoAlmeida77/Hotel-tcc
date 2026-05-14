const express = require("express");
const router = express.Router();
const quartosController = require("../controllers/quartosController");

// Rota estática deve vir ANTES de /:id para não ser capturada como parâmetro
router.get("/disponiveis", quartosController.listarQuartosDisponiveis);

router.get("/", quartosController.listarQuartos);
router.post("/", quartosController.cadastrarQuarto);
router.get("/:id", quartosController.buscarQuartoPorId);
router.put("/:id", quartosController.atualizarQuarto);
router.patch("/:id/status", quartosController.atualizarStatusQuarto);
router.delete("/:id", quartosController.excluirQuarto);

module.exports = router;
