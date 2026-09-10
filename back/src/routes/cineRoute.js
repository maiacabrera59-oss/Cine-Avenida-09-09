
const express = require("express");
const router = express.Router();

const { obtenerInicio, obtenerFunciones, comprarEntradas } = require("../controllers/cineController");

// GET  /api/inicio  
router.get("/inicio", obtenerInicio);

// GET  /api/funciones 
router.get("/funciones", obtenerFunciones);

// POST /api/entradas  
router.post("/entradas", comprarEntradas);

module.exports = router;