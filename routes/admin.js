var express = require('express')
var router = express.Router()
import Admin from '../controller/admin'

router.post('/v1/startSchedule', Admin.startSchedule)
router.post('/v1/addYuanMoney', Admin.addYuanMoney)
router.post('/v1/updateYuan', Admin.updateYuan)
router.post('/v1/addNotice', Admin.addNotice)
router.post('/v1/addAcitivity', Admin.addAcitivity)
router.post('/v1/addDaoju', Admin.addDaoju)
router.post('/v1/updateDaoju', Admin.updateDaoju)
module.exports = router