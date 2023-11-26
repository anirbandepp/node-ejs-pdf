const express = require('express');
const router = express.Router()

const { create } = require('../controller/excelController');

router.get("/excel", create);

module.exports = router;