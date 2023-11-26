const express = require('express');
const router = express.Router()

const { create } = require('../controller/requestController');

router.get("/create", create);

module.exports = router;