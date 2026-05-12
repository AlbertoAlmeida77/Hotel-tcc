const express = require("express");
const router = express.Router();

const quartosController = require("../controllers/quartosController");

router.get("/", quartosController.listarQuartos);
router.post("/", quartosController.cadastrarQuarto);
router.get("/:id", quartosController.buscarQuartoPorId);
router.put("/:id", quartosController.atualizarQuarto);
router.delete("/:id", quartosController.excluirQuarto);

module.exports = router;
