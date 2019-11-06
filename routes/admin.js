var express = require('express')
var router = express.Router()
import Admin from '../controller/admin'
import Upload from '../middware/upload'

router.post('/v1/startSchedule', Admin.startSchedule)
router.post('/v1/addYuanMoney', Admin.addYuanMoney)
router.post('/v1/updateYuan', Admin.updateYuan)
router.get('/v1/getYuan', Admin.getYuan)
router.get('/v1/getUser', Admin.getUser)
router.post('/v1/addNotice', Admin.addNotice)
router.post('/v1/addAcitivity', Admin.addAcitivity)
router.post('/v1/addDaoju', Upload.uploadMiddleware , Admin.addDaoju)
router.get('/v1/getUserInfo', Admin.getUserInfo)
router.get('/v1/getDaoju', Admin.getDaoju)
router.post('/v1/adminLogout', Admin.logout)
module.exports = router