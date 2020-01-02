var express = require('express')
var router = express.Router()
import Admin from '../controller/admin'
import Linan from '../controller/linan'

router.get('/v1/getYuan', Admin.getYuan)
router.post('/v1/startSchedule', Admin.startSchedule)
router.post('/v2/addJob', Linan.addJob)
router.post('/v2/updateJobView', Linan.updateJobView)
router.post('/v2/updateJob', Linan.updateJob)
module.exports = router