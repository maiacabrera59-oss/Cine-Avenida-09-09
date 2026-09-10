
const express = require("express");
const router = express.Router();

const { demoSecuencial, demoParalelo } = require("../controllers/demoController");


router.get("/secuencial", demoSecuencial);

router.get("/paralelo", demoParalelo);

module.exports = router;