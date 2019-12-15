let express = require('express');
let router = express.Router();
import User from '../controller/user'
import Admin from '../controller/admin'
import Linan from '../controller/linan'

router.post('/v1/adminLogin', Admin.adminLogin)
router.post('/v1/wechatLogin', User.wechatLogin)
router.post('/v2/login', Linan.login)
router.get('/v2/getJob', Linan.getJob)
router.post('/v1/wechatRegister', User.wechatRegister)
router.post('/v1/wechatRegisterName', User.wechatRegisterName)

module.exports = router