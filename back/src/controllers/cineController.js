
// CAPA DE CONTROLADORES 
const cineService = require("../services/cine.service");

function esErrorDeNegocio(error) {
    return typeof error.number === "number" && error.number >= 50000;
}

// GET /api/inicio
async function obtenerInicio(req, res) {
    try {
        const inicio = await cineService.obtenerInicio();
        res.json(inicio);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al cargar la pantalla de inicio", error: error.message });
    }
}

// GET /api/funciones 
async function obtenerFunciones(req, res) {
    try {
        const funciones = await cineService.funciones();
        res.json(funciones);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener funciones", error: error.message });
    }
}

// POST /api/entradas   
async function comprarEntradas(req, res) {
    try {
        const { idFuncion, cliente, cantidad } = req.body;

        if (!idFuncion || !cliente || !cantidad) {
            return res.status(400).json({ mensaje: "Debe completar todos los datos" });
        }

        const compra = await cineService.comprar({ idFuncion, cliente, cantidad });

        res.status(201).json({
            mensaje: "Compra registrada correctamente",
            idEntrada: compra.idEntrada,
            total: compra.total
        });
    } catch (error) {
        if (error.number === 50002) {
            return res.status(404).json({ mensaje: error.message });
        }
        if (esErrorDeNegocio(error)) {
            // 50003 cliente, 50004 cantidad, 50016 sin butacas
            return res.status(400).json({ mensaje: error.message });
        }
        res.status(500).json({ mensaje: "Error al registrar la compra", error: error.message });
    }
}

module.exports = { obtenerInicio, obtenerFunciones, comprarEntradas };