import jwtAuth from '../config/checkToken'
import user from './user'
import admin from './admin'
import unAuth from './unAuth'
import redisManager from '../config/redis'

export default (app) => {
  app.use('/unauth', unAuth)
  app.use(jwtAuth) // 验证token的有效性
  app.use(redisManager.refreshToken) // 每一次请求都刷新token的过期时间
  app.use('/user', user)
  app.use('/admin', admin)
}
