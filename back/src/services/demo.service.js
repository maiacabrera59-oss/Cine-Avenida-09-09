
const { getConnection } = require("../config/db");

async function consultaLenta() {
    const pool = await getConnection();
    await pool.request().execute("usp_DemoLento");
}

async function enSecuencia() {
    const inicio = Date.now();

    await consultaLenta();
    await consultaLenta();
    await consultaLenta();

    return { modo: "secuencial", milisegundos: Date.now() - inicio };
}


async function enParalelo() {
    const inicio = Date.now();

    await Promise.all([
        consultaLenta(),
        consultaLenta(),
        consultaLenta()
    ]);

    return { modo: "paralelo", milisegundos: Date.now() - inicio };
}

module.exports = { enSecuencia, enParalelo };