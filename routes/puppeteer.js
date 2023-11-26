const express = require('express');
const router = express.Router()

const { DeliveryChallan, certificate } = require('../controller/puppeteerController');

router.get("/delivery-challan", DeliveryChallan);

router.get("/certificate", certificate);

module.exports = router;