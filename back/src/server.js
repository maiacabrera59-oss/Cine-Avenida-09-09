
const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const logger = require("./middlewares/logger");
const cineRoutes = require("./routes/cineRoute");
const demoRoutes = require("./routes/demoRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);


app.use("/api", cineRoutes);
app.use("/api/demo", demoRoutes);

app.get("/", (req, res) => {
    res.send("API Cine Avenida funcionando");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});