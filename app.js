import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import path from 'path'
// import logger from './log'
import chalk from 'chalk'
import db from './mongodb/db.js' // 引入进来， 其内部自己调用
import router from './routes/index'

var app = express()
app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.headers.Origin || req.headers.origin || 'nianhui')
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  res.header("Access-Control-Allow-Credentials", true) //可以带cookies
	res.header("X-Powered-By", '3.2.1')
	if (req.method == 'OPTIONS') {
    res.sendStatus(200)
	} else {
    next()
	}
})

// logger.initRequestLogger(app) // 日志系统

// view engine setup
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(express.static(path.join(__dirname, 'public')))
// 静态服务使用 https://www.cnblogs.com/xiaozhuyuan/p/7207682.html
 
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true, limit: 50 * 1024 }))
// 返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
// for parsing application/x-www-form-urlencoded
// app.use('/api', index) // 给接口加前缀

router(app)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.json({
      message: 'invalid token',
      status: 401
    })
  } else {
    res.json({
      message: err.message,
      status: err.status
    })
  }
})

app.listen(8002, () => {
	console.log(
		chalk.green("成功监听端口8002")
	)
})