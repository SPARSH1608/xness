const express=require('express')
const { getCandleData } = require('../controllers/candleController')
const router=express.Router()

router.get('/:asset/:interval', getCandleData)

module.exports = router