import Base from './base';

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
    this.adminLogin = this.adminLogin.bind(this)
    this.getUserInfo = this.getUserInfo.bind(this)
    this.updateYuan = this.updateYuan.bind(this)
    this.getYuan = this.getYuan.bind(this)
    this.getUser = this.getUser.bind(this)
    this.addDaoju = this.addDaoju.bind(this)
    this.getDaoju = this.getDaoju.bind(this)
    this.startSchedule = this.startSchedule.bind(this)
    this.addNotice = this.addNotice.bind(this)
    this.getNotice = this.getNotice.bind(this)
    this.addAcitivity = this.addAcitivity.bind(this)
    this.getAcitivity = this.getAcitivity.bind(this)
  }
  
  async adminLogin (req, res) {
    let reqInfo = req.body
    let {username, pwd} = reqInfo
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
    let token = jsonwebtoken.sign({username}, constant.secretKey)
    let dateTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    if (userInfo) {
      // 用户已存在 去登录
      redisManager.set(token, username)
      res.json({
        status: 200,
        message: '登录成功',
        data: {token}
      })
    } else {
      let newUser = {
        username,
        pwd,
        createTime: dateTime,
        id: 1
      }
      try {
        AdminModel.create(newUser, (err, userInfo) => {
          if (err) {
            res.json({
              status: 0,
              message: '注册失败'
            })
          } else {
            if (userInfo) {
              redisManager.set(token, username)
              res.json({
                status: 200,
                message: '注册成功',
                data: {token}
              })
            }
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
      message: '退出成功'
    })
    redisManager.remove(req)
  }

  async getUserInfo (req, res) {
    let username = req.user.username
    let userInfo = await AdminModel.findOne({username}, {'_id': 0, '__v': 0, 'pwd': 0})
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

  async getYuan (req, res) {
    let {pageSize, pageNo} = req.query
    try {
      if (!pageSize) {
        throw new Error('pageSize不能为空')
      } else if (!pageNo) {
        throw new Error('pageNo不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let yuanList = await YuanModel.find({}).sort({_id: -1}).limit(parseInt(pageSize)).skip((pageNo - 1) * pageSize)
    if (yuanList) {
      res.json({
        status: 200,
        data: yuanList,
        message: '查询道具成功'
      })
    } else {
      res.json({
        status: 0,
        message: '查询道具失败'
      })
    }
  }

  async getUser (req, res) {
    let {pageSize, pageNo} = req.query
    try {
      if (!pageSize) {
        throw new Error('pageSize不能为空')
      } else if (!pageNo) {
        throw new Error('pageNo不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let userList = await UserModel.find({}).sort({_id: -1}).limit(parseInt(pageSize)).skip((pageNo - 1) * pageSize)
    if (userList) {
      res.json({
        status: 200,
        data: userList,
        message: '查询道具成功'
      })
    } else {
      res.json({
        status: 0,
        message: '查询道具失败'
      })
    }
  }

  async updateYuan (req, res) {
    // moneyArr 各自该加多少钱
    let {yuanId, finishedBy, moneyArr, status, operationText} = req.body
    try {
      if (!yuanId) {
        throw new Error('心愿ID不能为空')
      } else if (finishedBy.length === 0) {
        throw new Error('完成人不能为空')
      } else if (moneyArr.length === 0) {
        throw new Error('奖金不能为空')
      } else if (operationText.length === 0) {
        throw new Error('操作日志不能为空')
      } else if (!status) {
        throw new Error('状态不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    let dateTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    try {
      operationText.push({
        text: '管理员审核了心愿',
        time: dateTime
      })
      YuanModel.findOneAndUpdate({id: yuanId}, {$set: {
        status: 4,
        operationText,
        checkTime: dateTime
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
            operator: req.user.username,
            createTime: dateTime,
            opertionText: '心愿 '+ yuanId +'被审核了'
          })
          this.addYuanMoney(finishedBy[0], moneyArr[0])
          this.addYuanMoney(finishedBy[1], moneyArr[1])
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
            operator: req.user.username,
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
    let {des, money} = req.body
    try {
      if (!des) {
        throw new Error('描述不能为空')
      } else if (!money) {
        throw new Error('金额不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let createTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    let daojuList = await DaojuModel.find({})
    let newDaoju = {
      createTime,
      money,
      id: daojuList.length + 1,
      des
    }
    try {
      DaojuModel.create(newDaoju, (err, info) => {
        if (err) {
          res.json({
            status: 0,
            message: '添加失败'
          })
          return
        } 
        if (info) {
          res.json({
            status: 200,
            message: '添加成功'
          })
          this.addRecord({
            operator: req.user.username,
            createTime,
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
    let {pageSize, pageNo} = req.query
    try {
      if (!pageSize) {
        throw new Error('pageSize不能为空')
      } else if (!pageNo) {
        throw new Error('pageNo不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let daojuList = await DaojuModel.find({}, {'_id': 0, '__v': 0}).sort({_id: -1})
    // .limit(parseInt(pageSize)).skip((pageNo - 1) * pageSize)
    let list = daojuList.slice((pageNo - 1) * pageSize, pageNo * pageSize)
    if (daojuList) {
      res.json({
        status: 200,
        data: {
          count: daojuList.length,
          list
        },
        message: '查询道具成功'
      })
    } else {
      res.json({
        status: 0,
        message: '查询道具失败'
      })
    }
  }
  async startSchedule (req, res) {}
}

export default new Admin()
