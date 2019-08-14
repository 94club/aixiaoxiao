var express = require('express')
var router = express.Router()
import User from '../controller/user'

router.get('/v1/getUserInfo', User.getUserInfo)
router.get('/v1/getRecord', User.getRecord)
router.post('/v1/logout', User.logout)
router.post('/v1/saveMood', User.saveMood)
router.get('/v1/getMood', User.getMood)

module.exports = router