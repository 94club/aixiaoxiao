var express = require('express')
var router = express.Router()
import User from '../controller/user'
import Admin from '../controller/admin'

router.get('/v1/getUserInfo', User.getUserInfo)
router.post('/v1/saveMood', User.saveMood)
router.get('/v1/getMood', User.getMood)
router.post('/v1/saveYuan', User.saveYuan)
router.post('/v1/updateYuan', User.updateYuan)
router.get('/v1/getYuan', User.getYuan)
router.post('/v1/buyDaoju', User.buyDaoju)
router.post('/v1/daySign', User.daySign)

module.exports = router