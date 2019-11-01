import Base from './base';

const schedule = require('node-schedule');
import DaojuModel from '../models/daoju'
import NoticeModel from '../models/notice'
import YuanModel from '../models/yuan'
import dateAndTime from 'date-and-time'
import AdminModel from '../models/admin'
import UserModel from '../models/user'
import constant from '../constant/constant'
import jsonwebtoken from 'jsonwebtoken'
import redisManager from '../config/redis'

class Admin extends Base {
  constructor () {
    super()
    this.startSchedule = this.startSchedule.bind(this)
    this.addYuanMoney = this.addYuanMoney.bind(this)
    this.updateYuan = this.updateYuan.bind(this)
    this.getYuan = this.getYuan.bind(this)
    this.addNotice = this.addNotice.bind(this)
    this.getNotice = this.getNotice.bind(this)
    this.addAcitivity = this.addAcitivity.bind(this)
    this.getAcitivity = this.getAcitivity.bind(this)
    this.addDaoju = this.addDaoju.bind(this)
    this.getDaoju = this.getDaoju.bind(this)
    this.getUserInfo = this.getUserInfo.bind(this)
    this.adminLogin = this.adminLogin.bind(this)
  }
  
  async adminLogin (req, res) {
    let reqInfo = req.body
    let {username, pwd} = reqInfo
    console.log(reqInfo)
    const tokenObj = {
      username
    }
    try {
      if (!username) {
        throw new Error('用户不能为空')
      }else if (!pwd) {
        throw new Error('密码不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    // 先查一遍看看是否存在
    let userInfo = await AdminModel.findOne({username, pwd}, {'_id': 0, '__v': 0})
    let token = jsonwebtoken.sign(tokenObj, constant.secretKey)
    if (userInfo) {
      // 用户已存在 去登录
      redisManager.set(token, username)
      res.json({
        status: 200,
        message: '登录成功',
        data: {token, userInfo}
      })
      this.addRecord({
        username,
        createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
        opertionText: username + '登录成功'
      })
    } else {
      let newUser = {
        username,
        pwd,
        createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
        id: 1
      }
      try {
        AdminModel.create(newUser, (err) => {
          if (err) {
            res.json({
              status: 0,
              message: '注册失败'
            })
          } else {
            redisManager.set(token, username)
            res.json({
              status: 200,
              message: '注册成功',
              data: {token}
            })
            this.addRecord({
              username,
              createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
              opertionText: '用户' + username + '被创建了'
            })
          }
        })
      } catch (err) {
        res.json({
          status: 0,
          message: err.message
        })
      }
    }
  }

  async logout (req, res) {
    // 清楚redis中的token
    res.json({
      status: 200,
      data: '退出成功'
    })
    redisManager.remove(req)
  }

  async getUserInfo (req, res) {
    let username = req.user.username
    let userInfo = await AdminModel.findOne({username})
    if (userInfo) {
      res.json({
        status: 200,
        data: userInfo,
        message: '获取信息成功'
      })
    } else {
      res.json({
        status: 0,
        message: '获取信息失败'
      })
    }
  }

  async addYuanMoney (req, res) {
    let {id, gain} = req.body.id
    try {
      if (!id) {
        throw new Error('id不能为空')
      } else if (!parseInt(gain)) {
        throw new Error('金额要大于0')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    let userInfo = await UserModel.find({id})
    try {
      UserModel.updateOne({id}, {$set: {
        cpMoney: userInfo.cpMoney += gain
      }}, (err) => {
        if (err) {
          res.json({
            status: 0,
            message: '更新失败'
          })
        } else {
          res.json({
            status: 200,
            message: '更新成功'
          })
          this.addRecord({
            username: req.user.username,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + req.user.username + '更新了心愿币' + gain
          })
        }
      })
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
    }
  }

  async getYuan (req, res) {
    let {pageSize, page} = req.body
    if (!pageSize) {
      pageSize = 10
    }
    if (!page) {
      page = 1
    }
    let yuanList = await YuanModel.find({}).sort({_id: -1}).limit(pageSize).skip(page * pageSize)
    res.json({
      status: 200,
      data: yuanList,
      message: '查询成功'
    })
  }

  async updateYuan (req, res) {
    let {id} = req.body
    try {
      if (!id) {
        throw new Error('id不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    try {
      YuanModel.updateOne({id}, {$set: {
        status: 3
      }}, (err) => {
        if (err) {
          res.json({
            status: 0,
            message: '更新失败'
          })
        } else {
          res.json({
            status: 200,
            message: '更新成功'
          })
          this.addRecord({
            username: req.user.username,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '心愿 '+ id +'被审核了'
          })
        }
      })
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
    }
  }

  async addNotice (req, res) {
    let {des} = req.body
    try {
      if (!des) {
        throw new Error('描述不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let noticeList = await NoticeModel.find({})
    let newNotice = {
      des,
      id: noticeList.length + 1,
      createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    }
    try {
      NoticeModel.create(newNotice, (err) => {
        if (err) {
          res.json({
            status: 0,
            message: '添加失败'
          })
        } else {
          res.json({
            status: 200,
            message: '添加成功'
          })
          this.addRecord({
            username: req.user.username,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + req.user.username + '创建了公告'
          })
        }
      })
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
    }
  }

  async getNotice (req, res) {
    let noticeList = await NoticeModel.find({})
    res.json({
      status: 200,
      data: noticeList,
      message: '请求公告成功'
    })
  }
  async addAcitivity (req, res) {}
  async getAcitivity (req, res) {}
  async addDaoju (req, res) {
    console.log(req.formdata)
    console.log(req.file)
    let {des, type, amount} = res.body
    try {
      if (!des) {
        throw new Error('描述不能为空')
      } else if (!type) {
        throw new Error('类型不能为空')
      } else if (!amount) {
        throw new Error('数量必须大于0')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let daojuList = await DaojuModel.find({})
    let newDaoju = {
      createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
      amount,
      type,
      id: daojuList.length + 1,
      des
    }
    try {
      DaojuModel.create(newDaoju, (err) => {
        if (err) {
          res.json({
            status: 0,
            message: '添加失败'
          })
        } else {
          res.json({
            status: 200,
            message: '添加成功'
          })
          this.addRecord({
            username: req.user.username,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + req.user.username + '创建了道具'
          })
        }
      })
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
    }
  }
  async getDaoju (req, res) {
    let {ownerId, pageSize, page} = res.query
    if (!pageSize) {
      pageSize = 10
    }
    if (!page) {
      page = 1
    }
    try {
      if (!parseInt(ownerId)) {
        throw new Error('id不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let daojuList = await DaojuModel.find({ownerId}).sort({_id: -1}).limit(pageSize).skip(page * pageSize)
    res.json({
      status: 200,
      data: daojuList,
      message: '查询道具成功'
    })
  }
  async useDaoju (req, res) {

  }
  async startSchedule (req, res) {}
}

export default new Admin()
