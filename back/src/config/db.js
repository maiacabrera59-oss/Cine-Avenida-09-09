const sql = require("mssql");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../../.env")
});

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        instanceName: process.env.DB_INSTANCE,
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate: process.env.DB_TRUST_CERT === "true"
    }
};

let pool;

async function getConnection() {
    if (!pool) {
        pool = await sql.connect(config);
    }

    return pool;
}

module.exports = {
    sql,
    getConnection
};