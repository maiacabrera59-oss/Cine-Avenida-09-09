
const demoService = require("../services/demo.service");

// GET /api/demo/secuencial  (~3000 ms)
async function demoSecuencial(req, res) {
    try {
        const resultado = await demoService.enSecuencia();
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error en la demo", error: error.message });
    }
}

// GET /api/demo/paralelo    (~1000 ms)
async function demoParalelo(req, res) {
    try {
        const resultado = await demoService.enParalelo();
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error en la demo", error: error.message });
    }
}

module.exports = { demoSecuencial, demoParalelo };