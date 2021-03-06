var express = require('express')
var router = express.Router()
import User from '../controller/user'

router.get('/v1/getUserInfo', User.getUserInfo)
router.post('/v1/addMood', User.addMood)
router.get('/v1/getMood', User.getMood)
router.post('/v1/addYuan', User.addYuan)
router.post('/v1/updateYuan', User.updateYuan)
router.get('/v1/getYuan', User.getYuan)
router.post('/v1/buyDaoju', User.buyDaoju)
router.post('/v1/daySign', User.daySign)
router.post('/v1/resetBind', User.resetBind)
router.post('/v1/finishBind', User.finishBind)
router.get('/v1/getAllUser', User.getAllUser)
router.post('/v1/getImagePath', User.getImagePath)

module.exports = router