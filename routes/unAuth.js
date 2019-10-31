let express = require('express');
let router = express.Router();
import User from '../controller/user'
// import Upload from '../middware/upload'
import Admin from '../controller/admin'

router.post('/v1/userLogin', User.login)
router.post('/v1/adminLogin', Admin.login)
router.post('/wechatLogin', User.wechatLogin)
router.post('/wechatRegister', User.wechatRegister)
router.get('/getAllUser', User.getAllUser)
router.post('/bindUser', User.bindUser)

module.exports = router