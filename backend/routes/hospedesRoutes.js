const express = require("express");
const router = express.Router();

const hospedesController = require("../controllers/hospedesController");

router.get("/", hospedesController.listarHospedes);
router.post("/", hospedesController.cadastrarHospede);
router.get("/:id", hospedesController.buscarHospedePorId);
router.put("/:id", hospedesController.atualizarHospede);
router.delete("/:id", hospedesController.excluirHospede);

module.exports = router;
