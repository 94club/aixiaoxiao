var express = require('express')
var router = express.Router()
import Admin from '../controller/admin'

router.post('/v1/startSchedule', Admin.startSchedule)

module.exports = router