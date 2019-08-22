let express = require('express');
let router = express.Router();
import User from '../controller/user'
import Upload from '../middware/upload'

router.post('/v1/userLogin', User.login)
router.post('/v1/rootLogin', User.rootLogin)
router.post('/wechatLogin', User.wechatLogin)
router.post('/v1/videoUpload', Upload.uploadMiddleware, User.videoUpload)
router.post('/v1/excelUpload', Upload.uploadMiddleware, User.excelUpload)
router.post('/v1/getExcel', User.getExcel)

module.exports = router