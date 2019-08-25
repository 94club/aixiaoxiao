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
    this.login = this.login.bind(this)
    this.rootLogin = this.rootLogin.bind(this)
    this.getUserInfo = this.getUserInfo.bind(this)
    this.getRecord = this.getRecord.bind(this)
    this.logout = this.logout.bind(this)
    this.saveMood = this.saveMood.bind(this)
    this.getMood = this.getMood.bind(this)
    this.updateUserInfo = this.updateUserInfo.bind(this)
    this.buyDaoju = this.buyDaoju.bind(this)
    this.saveYuan = this.saveYuan.bind(this)
    this.updateYuan = this.updateYuan.bind(this)
    this.getYuan = this.getYuan.bind(this)
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
              message: '查找失败'
            })
          }
          console.log(res)
          let token
          // 先查一遍看看是否存在
          if (userInfo) {
            token = jsonwebtoken.sign({
              tokenName: userInfo.tokenName
            }, constant.secretKey)
            // 用户已存在 去登录
            redisManager.set(token, userInfo.tokenName)
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
            UserModel.find({}, (err, docs) => {
              if (err) {
                res.json({
                  status: 0,
                  message: '查询失败'
                })
              }
              let name = '幸福' + (docs.length + 1) + '号'
              let newUser = {
                nickName: name,
                openId,
                createBy: 0,
                createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
                id: 1,
                tokenName: name
              }
              try {
                UserModel.create(newUser, (err) => {
                  if (err) {
                    res.json({
                      status: 0,
                      message: '注册失败'
                    })
                  } else {
                    token = jsonwebtoken.sign({
                      tokenName: name
                    }, constant.secretKey)
                    redisManager.set(token, name)
                    res.json({
                      status: 200,
                      message: '注册成功',
                      data: {token}
                    })
                    try {
                      RecordModel.create({
                        username: name,
                        createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
                        opertionText: '用户' + name + '被创建了'
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
                  }
                })
              } catch (err) {
                res.json({
                  status: 0,
                  message: err.message
                })
              }
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
  async rootLogin (req, res) {
    let {username, password} = req.body
    const tokenObj = {
      username
    }
    try {
      if (!username) {
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
    let userInfo = await RootModel.findOne({username}, {'_id': 0, '__v': 0})
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
        opertionText: userInfo.des + '' + username + '登录成功'
      })
    } else {
        let newUser = {
          username,
          password,
          createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
          id: 1
        }
        try {
          RootModel.create(newUser, (err) => {
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

  async getUserInfo (req, res) {
    let userInfo = await UserModel.findOne({tokenName: req.user.tokenName}, {'_id': 0, '__v': 0, 'password': 0})
    if (userInfo) {
      res.json({
        status: 200,
        message: '查询成功',
        data: userInfo
      })
      this.addRecord({
        username: userInfo.tokenName,
        createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
        opertionText: userInfo.tokenName + '查询信息成功'
      })
    } else {
      res.json({
        status: 0,
        message: '用户查询失败'
      })
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

  async saveYuan (req, res) {
    let {type, des, title, amount} = req.body
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

  async buyDaoju (req, res) {
    // 查一遍道具的数量
  }

  async getYuan (req, res) {
    console.log(req.query)
    let {type, page, pageSize} = req.query
    if (!pageSize) {
      pageSize = 10
    }
    if (!page) {
      page = 1
    }
    try {
      if (!type) {
        
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
    }
    let yuanList = await YuanModel.find({type}).sort({_id: -1}).sort({_id: -1}).limit(pageSize).skip(page * pageSize)
    res.json({
      status: 200,
      message: '查询成功',
      data: yuanList
    })
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
