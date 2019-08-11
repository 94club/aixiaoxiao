let express = require('express');
let router = express.Router();
import User from '../controller/user'

router.post('/v1/userLogin', User.login)
router.post('/v1/rootLogin', User.rootLogin)
module.exports = router