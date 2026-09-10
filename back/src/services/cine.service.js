
const { sql, getConnection } = require("../config/db");

async function cartelera() {
    const pool = await getConnection();
    const resultado = await pool.request().execute("usp_Cartelera");
    return resultado.recordset;
}

async function funciones() {
    const pool = await getConnection();
    const resultado = await pool.request().execute("usp_ListarFunciones");
    return resultado.recordset;
}

async function resumen() {
    const pool = await getConnection();
    const resultado = await pool.request().execute("usp_ResumenVentas");
    return resultado.recordset[0];
}


async function obtenerInicio() {
    const [datosCartelera, datosFunciones, datosResumen] = await Promise.all([
        cartelera(),
        funciones(),
        resumen()
    ]);

    return {
        cartelera: datosCartelera,
        funciones: datosFunciones,
        resumen: datosResumen
    };
}


async function comprar({ idFuncion, cliente, cantidad }) {
    const pool = await getConnection();
    const resultado = await pool.request()
        .input("IdFuncion", sql.Int, idFuncion)
        .input("Cliente", sql.NVarChar(100), cliente)
        .input("Cantidad", sql.Int, cantidad)
        .execute("usp_ComprarEntradas");
    return resultado.recordset[0];
}

module.exports = { cartelera, funciones, resumen, obtenerInicio, comprar };