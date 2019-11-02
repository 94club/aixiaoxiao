let express = require('express');
let router = express.Router();
import User from '../controller/user'
import Admin from '../controller/admin'

router.post('/v1/adminLogin', Admin.adminLogin)
router.post('/v1/wechatLogin', User.wechatLogin)
router.post('/v1/wechatRegister', User.wechatRegister)
router.post('/v1/wechatRegisterName', User.wechatRegisterName)
router.post('/v1/wechatRegisterBindName', User.wechatRegisterBindName)
router.get('/v1/getAllUser', User.getAllUser)

module.exports = router