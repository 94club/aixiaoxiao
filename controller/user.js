'use strict'

import UserModel from '../models/user'
import RootModel from '../models/root'
import RecordModel from '../models/record'
import MoodModel from '../models/mood'
import DaojuModel from '../models/daoju'
import dateAndTime from 'date-and-time'
import constant from '../constant/constant'
import jsonwebtoken from 'jsonwebtoken'
import redisManager from '../config/redis'
const request = require('request')
import Base from './base'

class User extends Base{
  constructor () {
    super()
    this.getUserInfo = this.getUserInfo.bind(this)
    this.getRecord = this.getRecord.bind(this)
    this.updateUserInfo = this.updateUserInfo.bind(this)
    this.saveMood = this.saveMood.bind(this)
    this.getMood = this.getMood.bind(this)
    this.buyDaoju = this.buyDaoju.bind(this)
    this.useDaoju = this.useDaoju.bind(this)
    this.saveYuan = this.saveYuan.bind(this)
    this.updateYuan = this.updateYuan.bind(this)
    this.getYuan = this.getYuan.bind(this)
    this.wechatLogin = this.wechatLogin.bind(this)
    this.wechatRegister = this.wechatRegister.bind(this)
    this.getAllUser = this.getAllUser.bind(this)
  }

  async getUserInfo (req, res) {
    // updateTime 更新lastloginTime  
    let userInfo = await UserModel.findOne({nickName: req.user.tokenName}, {'_id': 0, '__v': 0, 'password': 0})
    if (userInfo) {
      res.json({
        status: 200,
        message: '查询成功',
        data: userInfo
      })
      this.addRecord({
        username: userInfo.nickName,
        createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
        opertionText: userInfo.nickName + '查询信息成功'
      })
    } else {
      res.json({
        status: 0,
        message: '用户查询失败'
      })
    }
  }

  async wechatRegister (req, res) {
    let {code} = req.body
    request(constant.wechatLoginUrl + code, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the baidu homepage.
        // {"session_key":"4JkHEf5pYabUASZkz8yKDQ==","openid":"o7PgB5et_Kccerxml7qrgbJE8-Oo"}
        let openId = body.openid
        // 判断是否已经注册了
        UserModel.findOne({openId}, {'_id': 0, '__v': 0}, (err, userInfo) => {
          if (err) {
            res.json({
              status: 0,
              message: '查询失败，请稍后重试'
            })
            return
          }
          if (userInfo) {
            res.json({
              status: 0,
              message: '已注册，请直接登录'
            })
          } else {
            res.json({
              status: 200,
              message: '获取微信openid成功',
              data: {openId}
            })
          }
        })
      } else {
        res.json({
          status: 0,
          message: '获取微信openid失败'
        })
      }
    })
  }

  async wechatRegisterName (req, res) {
    let optionData = req.body
    try {
      if (!optionData.nickName) {
        throw new Error('昵称不能为空')
      } else if (!optionData.openId) {
        throw new Error('微信认证信息不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    let registerData = {}
    let userArr = await UserModel.find({})
    let dateTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    registerData.id = userArr.length + 1
    registerData.openId = optionData.openId
    registerData.nickName = optionData.nickName
    registerData.cpName = optionData.cpName
    registerData.lastSignTime = dateTime
    registerData.createTime = dateTime
    try {
      UserModel.create(registerData, (err, userInfo) =>{
        if (err) {
          res.json({
            status: 0,
            message: '注册失败,请联系管理员(微信号feng--zao)'
          })
          return
        }
        console.log(res)
        let token = jsonwebtoken.sign({ tokenName: userInfo.nickName }, constant.secretKey)
            // 用户已存在 去登录
        redisManager.set(token, userInfo.nickName)
        res.json({
          status: 200,
          message: '注册成功',
          data: {token, userInfo}
        })
      })
    } catch (error) {
      res.json({
        status: 0,
        message: '注册失败,请联系管理员(微信号feng--zao)'
      })
    }
  }

  async getAllUser (req, res) {
    let {id} = req.query
    let userArr = await UserModel.find({'id': {$ne: id}, 'cpName': ''})
    if (userArr) {
      res.json({
        status: 200,
        message: '查询数据成功',
        data: userArr
      })
    } else {
      res.json({
        status: 0,
        message: '查询数据失败'
      })
    }
  }

  async wechatLogin (req, res) {
    let {code} = req.body
    request(constant.wechatLoginUrl + code, (error, response, body) => {
    if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the baidu homepage.
        // {"session_key":"4JkHEf5pYabUASZkz8yKDQ==","openid":"o7PgB5et_Kccerxml7qrgbJE8-Oo"}
        let openId = body.openid
        UserModel.findOne({openId}, (err, userInfo) =>{
          if (err) {
            res.json({
              status: 0,
              message: '查找失败,请联系管理员(微信号feng--zao)'
            })
          }
          console.log(res)
          let token
          // 先查一遍看看是否存在
          if (userInfo) {
            token = jsonwebtoken.sign({ tokenName: userInfo.nickName }, constant.secretKey)
            // 用户已存在 去登录
            redisManager.set(token, userInfo.nickName)
            res.json({
              status: 200,
              message: '登录成功',
              data: {token, userInfo}
            })
            try {
              RecordModel.create({
                username: userInfo.nickName,
                createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
                opertionText: userInfo.nickName + '登录成功'
              }, (err) => {
                if (err) {
                  console.log('日志写入失败')
                } else {
                  console.log('日志写入成功')
                }
              })
            } catch (err) {
              console.log('日志写入catch失败')
            }
          } else {
            res.json({
              status: 0,
              message: '查找失败,请联系管理员(微信号feng--zao)'
            })
          }
        })
      }
    })
  }

  async login (req, res) {
    let reqInfo = req.body
    let {nickName} = reqInfo
    console.log(reqInfo)
    const tokenObj = {
      nickName
    }
    try {
      if (!nickName) {
        throw new Error('用户不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    // 先查一遍看看是否存在
    let userInfo = await UserModel.findOne({nickName}, {'_id': 0, '__v': 0})
    let token = jsonwebtoken.sign(tokenObj, constant.secretKey)
    if (userInfo) {
      // 用户已存在 去登录
      redisManager.set(token, nickName)
      res.json({
        status: 200,
        message: '登录成功',
        data: {token, userInfo}
      })
      this.addRecord({
        username: nickName,
        createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
        opertionText: userInfo.des + '' + nickName + '登录成功'
      })
    } else {
        let newUser = {
          nickName: reqInfo.nickName,
          avatarUrl: reqInfo.avatarUrl,
          city: reqInfo.city,
          province: reqInfo.province,
          country: reqInfo.country,
          language: reqInfo.language,
          gender: reqInfo.gender,
          createBy: 0,
          createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
          id: 1
        }
        try {
          UserModel.create(newUser, (err) => {
            if (err) {
              res.json({
                status: 0,
                message: '注册失败'
              })
            } else {
              redisManager.set(token, nickName)
              res.json({
                status: 200,
                message: '注册成功',
                data: {token}
              })
              this.addRecord({
                username: nickName,
                createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
                opertionText: '用户' + nickName + '被创建了'
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
  
  async saveYuan (req, res) {
    let {type, des, amount} = req.body
    try {
      if (!type) {
        throw new Error('类型不能为空')
      } else if (!title) {
        throw new Error('标题不能为空')
      } else if (!amount) {
        throw new Error('心愿币不能为空')
      } else if (!des) {
        throw new Error('描述不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    let operationText = []
    let userInfo = await UserModel.findOne({tokenName: req.user.tokenName})
    let status = 1
    operationText.push({text: '任务正在审核中', time: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")})
    if (userInfo.activeNumber > 50) {
      status = 3
      operationText.push({text: '任务自动审核通过', time: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")})
    }
    let yuanList = await YuanModel.find({})
    let newYuan = {
      type,
      des,
      title,
      amount,
      status,
      createdBy: name,
      id: yuanList.length + 1
    }
    try {
      YuanModel.create(newYuan, (err) => {
        if (err) {
          res.json({
            status: 0,
            message: '申请失败'
          })
        } else {
          res.json({
            status: 200,
            message: '申请成功'
          })
          this.addCpMoney(userInfo.tokenName, 50)
          this.addActiveNumber(userInfo.tokenName, 1)
          this.addRecord({
            username: userInfo.tokenName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + userInfo.tokenName + '申请了一个心愿'
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

  async updateYuan (req, res) {
    let {status, daojuId, id, amount, createdBy, accectedBy, operationText} = req.body
    try {
      if (!status) {
        throw new Error('状态不能为空')
      } else if (!id) {
        throw new Error('id不能为空')
      } else if (!amount) {
        throw new Error('心愿币不能为空')
      } else if (!createdBy) {
        throw new Error('创建人不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    try {
      let daojuInfo = ''
      let temp = ''
      if (daojuId) {
        daojuInfo = await DaojuModel.findOne({id: daojuId})
      }
      switch (status){
        case 2:
            operationText.push({text: '任务审核通过,待领取', time: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")})
          break;
        case 3:
            if (daojuId) {
              operationText.push({text: accectedBy + '使用了道具卡' + daojuInfo.des, time: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")})
            } else {
              operationText.push({text: '任务被' + accectedBy + '领取，正在进行中', time: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")})
            }
          break;
        case 4:
            operationText.push({text: createdBy + '结束了任务', time: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")})
          break;
        case 5:
            operationText.push({text: '系统关闭了任务', time: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")})
          break;
        default:
          break;
      }
      if (daojuId === 1) {
        amount *= 0.5
      }
      if (daojuId === 2) {
        amount *= 2
      }
      if (daojuId === 4 && status === 3) {
        temp = accectedBy
        accectedBy = createdBy
        createdBy = temp
      }
      YuanModel.updateOne({id}, {$set: {
        amount,
        daojuId,
        status,
        createBy,
        accectedBy
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
          if (daojuId) {
            this.useDaoju(daojuId, req.user.tokenName)
          }
          this.addRecord({
            username: req.user.tokenName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + req.user.tokenName + '更新了心愿'
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
    console.log(req.query)
    // 首页可以看所有的   进入内页只能看自己的
    let {type, page, pageSize, stauts, createdBy} = req.query
    if (!pageSize) {
      pageSize = 10
    }
    if (!page) {
      page = 1
    }
    try {
      if (!type) {
        throw new Error('类型不能为空')
      } else if (!status) {
        throw new Error('状态不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
    }
    let yuanList = await YuanModel.find({type, stauts, createdBy}).sort({_id: -1}).limit(pageSize).skip(page * pageSize)
    res.json({
      status: 200,
      message: '查询成功',
      data: yuanList
    })
  }

  async buyDaoju (req, res) {
    // 查一遍道具的数量
    let {id, cpMoney} = res.body
    try {
      if (!id) {
        throw new Error('id不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
    }
    let daojuInfo = await DaojuModel.find({id})
    if (daojuInfo.amount === 0) {
      res.json({
        status: 0,
        message: '数量不足，请提醒管理员补货'
      })
      return
    }
    let userInfo = await UserModel.findOne({tokenName: req.user.tokenName})
    if (userInfo.cpMoney > cpMoney) {
      
    } else {
      res.json({
        status: 0,
        message: '心愿币不足，请多发表心情，多签到和完成TA的心愿'
      })
    }
  }

  async useDaoju (req, res) {
    // 查一遍道具的数量
  }

  async saveMood (req, res) {
    let reqInfo = req.body
    let moodList = await MoodModel.find({})
    let {des, imageStrList, videoPath} = reqInfo
    let tokenName = req.user.tokenName
    try {
      if (!des) {
        throw new Error('心情不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    let newMood = {
      des,
      imageStrList,
      videoPath,
      createBy: tokenName,
      createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
      id: moodList.length + 1
    }
    try {
      MoodModel.create(newMood, (err) => {
        let gain = 0
        if (newMood.des.length > 30) {
          gain += 50
        } else {
          gain += 30
        }
        if (newMood.videoPath) {
          gain += 20
        }
        let sl = newMood.imageStrList.length
        if (sl > 0) {
          gain += (20 * sl)
        }
        if (err) {
          res.json({
            status: 0,
            message: '添加失败'
          })
        } else {
          res.json({
            status: 200,
            message: '添加成功,收获' + gain + '心愿币'
          })
          this.addCpMoney(tokenName, gain)
          this.addActiveNumber(tokenName, 1)
          this.addRecord({
            username: tokenName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + tokenName + '创建了心愿'
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

  async getMood (req, res) {
    let moodList = await MoodModel.find({}, {'_id': 0, '__v': 0})
    if (moodList) {
      res.json({
        status: 200,
        message: '查询成功',
        data: moodList
      })
    } else {
      res.json({
        status: 0,
        message: '查询失败，请联系管理员'
      })
    }
  }

  async daySign (req, res) {
    let tokenName = req.user.tokenName
    let userInfo = await UserModel.findOne({tokenName})
    let gain = 0
    let lastSignTime = ''
    if (userInfo.lastSignTime) {
      lastSignTime = new Date().getTime()
      let now = lastSignTime - new Date(userInfo.lastSignTime).getTime()
      if (now < 24 * 60 * 60 * 1000) {
        userInfo.continueSignTiems++
        gain = userInfo.continueSignTiems % 7 * 5
        userInfo.cpMoney += gain
      } else {
        userInfo.continueSignTiems = 1
      }
    } else {
      userInfo.continueSignTiems = 1
    }
    UserModel.update({tokenName}, {$set: {
      cpMoney: userInfo.cpMoney += 5,
      isSignToday: true,
      lastSignTime,
      continueSignTiems: userInfo.continueSignTiems,
      activeNumber: userInfo.activeNumber + 1,
      signTimes: userInfo.signTimes + 1
    }}, (error) => {
      if (error) {
        console.error(error);
        res.json({
          status: 0,
          message: '签到失败，请联系管理员muduo770'
        })
      } else {
        if (gain > 0) {
          res.json({
            status: 200,
            message: '连续签到成功，奖励' + (gain + 5) + '心愿币'
          })
          this.addCpMoney(tokenName, gain + 5)
          this.addRecord({
            username: tokenName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + tokenName + '连续签到成功'
          })
        } else {
          res.json({
            status: 200,
            message: '签到成功，奖励5心愿币'
          })
          this.addCpMoney(nickName, gain)
          this.addRecord({
            username: nickName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + nickName + '签到成功'
          })
        }
        this.addActiveNumber(tokenName, userInfo.continueSignTiems)
      }
    })
  }

  async updateUserInfo (req, res) {
    let {nickName, wechat, cpName} = req.body
    try {
      if (!nickName && !wechat && !cpName) {
        throw new Error('修改数据不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    if (nickName) {
      let userInfo = await UserModel.findOne({tokenName:  req.user.tokenName})
      UserModel.updateOne({tokenName: req.user.tokenName}, {$set: {
        nickName,
        nameChangeTimes: userInfo.nameChangeTimes--
      }}, (error) => {
        if (error) {
          console.error(error);
          res.json({
            status: 0,
            message: '修改失败，请联系管理员muduo770'
          })
        } else {
          res.json({
            status: 200,
            message: '昵称修改成功'
          })

          this.addRecord({
            username: req.user.tokenName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + req.user.tokenName + '修改昵称-->' + nickName
          })
        }
      })
    }
    if (cpName) {
      let userInfo = await UserModel.findOne({tokenName:  req.user.tokenName})
      UserModel.updateOne({tokenName: req.user.tokenName}, {$set: {
        cpName: userInfo.cpName
      }}, (error) => {
        if (error) {
          console.error(error);
          res.json({
            status: 0,
            message: '绑定失败，请联系管理员muduo770'
          })
        } else {
          res.json({
            status: 200,
            message: '绑定搭档成功，奖励50心愿币'
          })
          this.addCpMoney(req.user.tokenName, 50)
          this.addActiveNumber(req.user.tokenName, 5)
          this.addRecord({
            username: req.user.tokenName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + req.user.tokenName + '绑定搭档昵称' + cpName
          })
        }
      })
    }
    if (wechat) {
      UserModel.updateOne({tokenName: req.user.tokenName}, {$set: {
        wechat
      }}, (error) => {
        if (error) {
          console.error(error);
          res.json({
            status: 0,
            message: '修改失败，请联系管理员muduo770'
          })
        } else {
          res.json({
            status: 200,
            message: 'wechat修改成功'
          })
          this.addRecord({
            username: req.user.tokenName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + req.user.tokenName + '修改微信号-->' + wechat
          })
        }
      })
    }
  }
  
}

export default new User()
