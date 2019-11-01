let express = require('express');
let router = express.Router();
import User from '../controller/user'
import Admin from '../controller/admin'

router.post('/v1/adminLogin', Admin.adminLogin)
router.post('/wechatLogin', User.wechatLogin)
router.post('/wechatRegister', User.wechatRegister)
router.post('/wechatRegisterName', User.wechatRegisterName)
router.get('/getAllUser', User.getAllUser)

module.exports = router