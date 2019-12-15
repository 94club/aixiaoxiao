var express = require('express')
var router = express.Router()
import Admin from '../controller/admin'

router.post('/v1/startSchedule', Admin.startSchedule)
router.post('/v1/addYuanMoney', Admin.addYuanMoney)
router.post('/v1/updateYuan', Admin.updateYuan)
router.get('/v1/getYuan', Admin.getYuan)
module.exports = router