const express = require('express')
const { getCandleData, getPrices } = require('../controllers/candleController')
const router = express.Router()

router.get('/prices', getPrices)
router.get('/:asset/:interval', getCandleData)

module.exports = router