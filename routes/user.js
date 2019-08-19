var express = require('express')
var router = express.Router()
import User from '../controller/user'

router.get('/v1/getUserInfo', User.getUserInfo)
router.get('/v1/getRecord', User.getRecord)
router.post('/v1/logout', User.logout)
router.post('/v1/saveMood', User.saveMood)
router.get('/v1/getMood', User.getMood)
router.post('/v1/saveYuan', User.saveYuan)
router.post('/v1/updateYuan', User.updateYuan)
router.post('/v1/buyDaoju', User.buyDaoju)
router.get('/v1/getYuan', User.getYuan)
router.post('/v1/daySign', User.daySign)
router.post('/v1/updateUserInfo', User.updateUserInfo)

module.exports = router