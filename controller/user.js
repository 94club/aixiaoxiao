'use strict'

import UserModel from '../models/user'
import RecordModel from '../models/record'
import MoodModel from '../models/mood'
import DaojuModel from '../models/daoju'
import YuanModel from '../models/yuan'
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
    this.addMood = this.addMood.bind(this)
    this.getMood = this.getMood.bind(this)
    this.buyDaoju = this.buyDaoju.bind(this)
    this.useDaoju = this.useDaoju.bind(this)
    this.getDaoju = this.getDaoju.bind(this)
    this.addYuan = this.addYuan.bind(this)
    this.updateYuan = this.updateYuan.bind(this)
    this.getYuan = this.getYuan.bind(this)
    this.wechatLogin = this.wechatLogin.bind(this)
    this.wechatRegister = this.wechatRegister.bind(this)
    this.wechatRegisterName = this.wechatRegisterName.bind(this)
    this.getAllUser = this.getAllUser.bind(this)
    this.resetBind = this.resetBind.bind(this)
    this.finishBind = this.finishBind.bind(this)
    this.getImagePath = this.getImagePath.bind(this)
  }

  async getUserInfo (req, res) {
    // updateTime 更新lastloginTime  
    let userInfo = await UserModel.findOne({nickName: req.user.tokenName}, {'_id': 0, '__v': 0})
    if (userInfo) {
      res.json({
        status: 200,
        message: '查询成功',
        data: userInfo
      })
      this.addRecord({
        operator: userInfo.nickName,
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
    let optionData = req.body
    try {
      if (!optionData.nickName) {
        throw new Error('昵称不能为空')
      } else if (!optionData.code) {
        throw new Error('微信认证信息不能为空')
      } else if (!optionData.avatarUrl) {
        throw new Error('微信头像信息不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    request(constant.wechatLoginUrl + optionData.code, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        // Show the HTML for the baidu homepage.
        // {"session_key":"4JkHEf5pYabUASZkz8yKDQ==","openid":"o7PgB5et_Kccerxml7qrgbJE8-Oo"}
        let weData = JSON.parse(body)
        // 判断是否已经注册了
        let openId = weData.openid
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
              message: '已注册，请直接登录',
              data: userInfo
            })
          } else {
            UserModel.find({}, (err, userArr) => {
              if (err) {
                res.json({
                  status: 0,
                  message: '查询失败，请稍后重试'
                })
                return
              }
              if (userArr) {
                // 注册
                let registerData = {}
                console.log(openId + '---')
                let dateTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
                registerData.id = userArr.length + 1
                registerData.openId = openId
                registerData.nickName = optionData.nickName
                registerData.lastSignTime = dateTime
                registerData.createTime = dateTime
                registerData.avatarUrl = optionData.avatarUrl
                try {
                  UserModel.create(registerData, (err, userInfo) =>{
                    if (err) {
                      res.json({
                        status: 0,
                        message: '注册失败,请联系管理员(微信号feng--zao)'
                      })
                      return
                    }
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
    // cpID是自己的id   userId是对方的
    let {cpName, cpWechat, cpId, userId} = req.body
    try {
      if (!cpName) {
        throw new Error('绑定昵称不能为空')
      } else if (!cpWechat) {
        throw new Error('绑定微信不能为空')
      } else if (!cpId) {
        throw new Error('绑定ID不能为空')
      } else if (!userId) {
        throw new Error('对方ID不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    // 先判断自己的状态  再去更新 TODO

    //先把自己isbind更新
    UserModel.findOneAndUpdate({id: cpId}, {$set: {isBind: 2}}, (err, userInfo) => {
      if (err) {
        res.json({
          status: 0,
          message: '内部错误,更新数据失败,请联系管理员(微信号feng--zao)'
        })
        return
      }
      if (userInfo) {
        UserModel.findOneAndUpdate({id: userId}, {$set: {isBind: 2, cpName, cpWechat, cpId}}, (err, info) => {
          if (err) {
            res.json({
              status: 0,
              message: '内部错误,更新数据失败,请联系管理员(微信号feng--zao)'
            })
            return
          }
          if (info) {
            res.json({
              status: 200,
              message: '绑定成功'
            })
          } else {
            res.json({
              status: 0,
              message: '更新数据失败,请联系管理员(微信号feng--zao)'
            })
          }
        })
      } else {
        res.json({
          status: 0,
          message: '更新数据失败,请联系管理员(微信号feng--zao)'
        })
      }
    })
  }

  async resetBind (req, res) {
    // cpId---isBind--->1    userId----isBind--->1---cp***---''
    let {cpId, userId} = req.body
    try {
      if (!cpId) {
        throw new Error('绑定id不能为空')
      } else if (!userId) {
        throw new Error('用户id不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    UserModel.findOneAndUpdate({id: cpId}, {$set: {isBind: 1}}, (err, userInfo) => {
      if (err) {
        res.json({
          status: 0,
          message: '内部错误,更新数据失败,请联系管理员(微信号feng--zao)'
        })
        return
      }
      if (userInfo) {
        UserModel.findOneAndUpdate({id: userId}, {$set: {isBind: 1, cpName: '', cpWechat: '', cpId: 0}}, (err, info) => {
          if (err) {
            res.json({
              status: 0,
              message: '内部错误,更新数据失败,请联系管理员(微信号feng--zao)'
            })
            return
          }
          if (info) {
            res.json({
              status: 200,
              message: '解绑成功'
            })
          } else {
            res.json({
              status: 0,
              message: '更新数据失败,请联系管理员(微信号feng--zao)'
            })
          }
        })
      } else {
        res.json({
          status: 0,
          message: '更新数据失败,请联系管理员(微信号feng--zao)'
        })
      }
    })
  }

  async finishBind (req, res) {
    let {cpId, userId, nickName} = req.body
    try {
      if (!cpId) {
        throw new Error('绑定id不能为空')
      } else if (!userId) {
        throw new Error('用户id不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    UserModel.findOneAndUpdate({id: cpId}, {$set: {isBind: 3, cpName: nickName, cpId: userId}}, (err, userInfo) => {
      if (err) {
        res.json({
          status: 0,
          message: '内部错误,更新数据失败,请联系管理员(微信号feng--zao)'
        })
        return
      }
      if (userInfo) {
        UserModel.findOneAndUpdate({id: userId}, {$set: {isBind: 3,}}, (err, info) => {
          if (err) {
            res.json({
              status: 0,
              message: '内部错误,更新数据失败,请联系管理员(微信号feng--zao)'
            })
            return
          }
          if (info) {
            res.json({
              status: 200,
              message: '绑定成功'
            })
          } else {
            res.json({
              status: 0,
              message: '更新数据失败,请联系管理员(微信号feng--zao)'
            })
          }
        })
      } else {
        res.json({
          status: 0,
          message: '更新数据失败,请联系管理员(微信号feng--zao)'
        })
      }
    })
  }

  async getAllUser (req, res) {
    let {id} = req.query
    try {
      if (!id) {
        throw new Error('用户id不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    let userArr = await UserModel.find({'id': {$ne: id}, 'isBind': 1})
    if (userArr) {
      res.json({
        status: 200,
        message: '查询数据成功',
        data: userArr
      })
    } else {
      res.json({
        status: 0,
        message: '查询数据失败,请联系管理员(微信号feng--zao)'
      })
    }
  }

  async wechatLogin (req, res) {
    let {code} = req.body
    try {
      if (!code) {
        throw new Error('登录认证不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    request(constant.wechatLoginUrl + code, (error, response, body) => {
    if (!error && response.statusCode == 200) {
        // Show the HTML for the baidu homepage.
        // {"session_key":"4JkHEf5pYabUASZkz8yKDQ==","openid":"o7PgB5et_Kccerxml7qrgbJE8-Oo"}
        let weData = JSON.parse(body)
        // 判断是否已经注册了
        let openId = weData.openid
        UserModel.findOne({openId}, (err, userInfo) =>{
          if (err) {
            res.json({
              status: 0,
              message: '查找失败,请联系管理员(微信号feng--zao)'
            })
          }
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
        operator: nickName,
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
                operator: nickName,
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
  
  async getYuan (req, res) {
    // 首页可以看所有的   进入内页只能看自己的
    let {pageNo, pageSize, status, keyword, reason} = req.query
    // reason 1关键字搜索 2首页获取 3自己获取
    try {
      if (!reason) {
        throw new Error('搜索方式不能为空')
      } if (reason === 1 && !keyword) {
        throw new Error('搜索关键字不能为空')
      } else if (!pageSize) {
        throw new Error('pageSize不能为空')
      } else if (!pageNo) {
        throw new Error('pageNo不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
    }
    let filter
    if (reason === 1) {
      let reg = new RegExp(keyword, 'i')
      filter = {
        "type": {"$ne": 4},
        "des": {"$regex": reg}
      }
    }
    if (reason === 2) {
      filter = {
        "type": {"$ne": 4},
        $or: [
          {status}
        ]
      }
    }
    if (reason === 3) {
      filter = {
        "type": 4
      }
    }
    let yuanList = await YuanModel.find(filter).sort({_id: -1}).limit(parseInt(pageSize)).skip((pageNo - 1) * pageSize)
    if (yuanList) {
      res.json({
        status: 200,
        message: '查询成功',
        data: yuanList
      })
    } else {
      res.json({
        status: 0,
        message: '查询失败,请联系管理员(微信号feng--zao)'
      })
    }
  }

  async addYuan (req, res) {
    let {type, des, amount, createdBy} = req.body
    try {
      if (!type) {
        throw new Error('类型不能为空')
      } else if (!amount) {
        throw new Error('心愿币不能为空')
      } else if (!des) {
        throw new Error('描述不能为空')
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
    let operationText = []
    let dateTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    operationText.push({text: createdBy + '创建了心愿', time: dateTime})
    let yuanList = await YuanModel.find({})
    let newYuan = {
      id: yuanList.length + 1,
      status: 1,
      des,
      createTime: dateTime,
      type,
      amount: parseInt(amount),
      createdBy,
      operationText,
    }
    try {
      YuanModel.create(newYuan, (err, yuanInfo) => {
        if (err) {
          res.json({
            status: 0,
            message: '创建失败,请联系管理员(微信号feng--zao)'
          })
        } else {
          res.json({
            status: 200,
            message: '创建成功'
          })
          this.addYuanMoney(yuanInfo.createdBy, 50)
          // this.addActiveNumber(yuanInfo.createdBy, 1)
          this.addRecord({
            operator: yuanInfo.createdBy,
            createTime: dateTime,
            opertionText: '用户' + yuanInfo.createdBy + '创建了一个心愿， id=' + yuanList.length
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
    // 点击完成（会操作同一条数据，需要锁）  使用道具  点击审核
    let {status, daojuId, daojuDes, daojuArr, yuanId, userId, finishedBy, submitTime, operationText} = req.body
    let operator = req.user.tokenName
    try {
      if (!status) {
        throw new Error('操作状态不能为空')
      } else if (!yuanId) {
        throw new Error('心愿ID不能为空')
      } else if (!userId) {
        throw new Error('用户ID不能为空')
      } else if (status === 3 && !daojuId) {
        throw new Error('道具ID不能为空')
      } else if (finishedBy.length === 0) {
        throw new Error('完成人不能为空')
      } else if (submitTime.length === 0) {
        throw new Error('提交时间不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    let dateTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    if (status === 2) {
      // 完成了这个任务
      operationText.push({
        text: operator + '完成了心愿',
        time: dateTime
      })
      finishedBy.push(userId)
      try {
        YuanModel.findOneAndUpdate({id: yuanId}, {$set: {status: 2, finishedBy, submitTime, operationText}}, {new: true}, (err, yuanInfo) => {
          if (err) {
            res.json({
              status: 0,
              message: '更新失败,请联系管理员(微信号feng--zao)'
            })
            return
          }
          res.json({
            status: 200,
            message: '更新成功',
            data: yuanInfo
          })
        })
      } catch (error) {
        res.json({
          status: 0,
          message: '更新失败,请联系管理员(微信号feng--zao)'
        })
      }
    }
    if (status === 3) {
      // 使用道具
      daojuArr.push(daojuId)
      operationText.push({
        text: operator + '使用了道具' + daojuId + ',' + daojuDes,
        time: dateTime
      })
      try {
        YuanModel.findOneAndUpdate({id: yuanId}, {$set: {status: 2, operationText}}, {new: true}, (err, yuanInfo) => {
          if (err) {
            res.json({
              status: 0,
              message: '更新失败,请联系管理员(微信号feng--zao)'
            })
            return
          }
          res.json({
            status: 200,
            message: '更新成功',
            data: yuanInfo
          })
          // 跟新道具ID
          this.useDaoju(daojuId)
        })
      } catch (error) {
        res.json({
          status: 0,
          message: '更新失败,请联系管理员(微信号feng--zao)'
        })
      }
    }
  }

  async getDaoju (req, res) {
    let {ownerId, pageSize, pageNo} = req.query
    try {
      if (!ownerId) {
        throw new Error('用户id不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
    }
  }

  async buyDaoju (req, res) {
    // 查一遍道具的数量
    let {ownerId, money, ownerName, id, des} = req.body
    let createTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss") 
    try {
      if (!id) {
        throw new Error('道具id不能为空')
      } else if (!ownerId) {
        throw new Error('用户ownerId不能为空')
      } else if (!money) {
        throw new Error('道具money不能为空')
      } else if (!ownerName) {
        throw new Error('用户ownerName不能为空')
      } else if (!des) {
        throw new Error('道具des不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
    }
    let daojuList = await DaojuModel.find({})
    let createData = {
      createTime,
      type,
      des,
      id: daojuList.length + 1,
      money,
      ownerId,
      ownerName
    }
    try {
      DaojuModel.create(createData, (err, info) => {
        if (err) {
          res.json({
            status: 0,
            message: '添加失败,请联系管理员(微信号feng--zao)'
          })
          return
        }
        if (info) {
          res.json({
            status: 200,
            message: '购买成功'
          })
          this.addYuanMoney(ownerId, -money)
          this.addRecord({
            operator: ownerName,
            createTime,
            opertionText: '用户' + ownerName + '购买了道具'
          })
        }
      })
    } catch (error) {
      res.json({
        status: 0,
        message: '购买失败,请联系管理员(微信号feng--zao)'
      })
    }
  }

  async useDaoju (req, res) {
    let {id} = req.body
    try {
      if (!id) {
        throw new Error('道具id不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: err.message
      })
    }
    try {
      // findoneandupdate只会更新第一条查到的数据  update会更新所有查到的数据
      DaojuModel.updateOne({id}, {$set: {
        isUsed: true,
        usedTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
      }}, (err) => {
        if (err) {
          console.log('日志写入失败')
        } else {
          this.addRecord({
            operator: req.user.tokenName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + req.user.tokenName + '使用了道具卡' + id
          })
        }
      })
    } catch (error) {
      
    }
  }

  async addMood (req, res) {
    let reqInfo = req.body
    let {des, imageStrList, videoPath, voicePath, userId, nickName} = reqInfo
    try {
      if (!des) {
        throw new Error('心情描述不能为空')
      } else if (!userId) {
        throw new Error('用户id不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    let moodList = await MoodModel.find({})
    let dataTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    let newMood = {
      des,
      imageStrList,
      videoPath,
      voicePath,
      headerImage,
      createName: nickName,
      userId,
      createTime: dataTime,
      id: moodList.length + 1
    }
    try {
      MoodModel.create(newMood, (err, info) => {
        let gain = 0
        if (newMood.des.length > 30) {
          gain += 50
        } else {
          gain += 30
        }
        if (newMood.videoPath) {
          gain += 20
        }
        if (newMood.voicePath) {
          gain += 20
        }
        let sl = newMood.imageStrList.length
        if (sl > 0) {
          gain += (20 * sl)
        }
        if (err) {
          res.json({
            status: 0,
            message: '添加失败,请联系管理员(微信号feng--zao)'
          })
          return
        }
        if (info) {
          res.json({
            status: 200,
            message: '添加成功,收获' + gain + '心愿币'
          })
          this.addYuanMoney(userId, gain)
          // this.addActiveNumber(tokenName, 1)
          this.addRecord({
            operator: nickName,
            createTime: dataTime,
            opertionText: '用户' + nickName + '创建了心情'
          })
        }
      })
    } catch (err) {
      res.json({
        status: 0,
        message: '添加失败,请联系管理员(微信号feng--zao)'
      })
    }
  }

  async getMood (req, res) {
    let {userId, pageNo, pageSize} = req.query
    try {
      if (!pageSize) {
        throw new Error('pageSize不能为空')
      } else if (!pageNo) {
        throw new Error('pageNo不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return   
    }
    let filter ={}
    if (userId) {
      filter = {userId}
    }
    let moodList = await MoodModel.find(filter, {'_id': 0, '__v': 0}).sort({_id: -1}).limit(parseInt(pageSize)).skip((pageNo - 1) * pageSize)
    if (moodList) {
      res.json({
        status: 200,
        message: '查询成功',
        data: moodList
      })
    } else {
      res.json({
        status: 0,
        message: '查询失败,请联系管理员(微信号feng--zao)'
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
        res.json({
          status: 0,
          message: '查询失败,请联系管理员(微信号feng--zao)'
        })
      } else {
        if (gain > 0) {
          res.json({
            status: 200,
            message: '连续签到成功，奖励' + (gain + 5) + '心愿币'
          })
          this.addYuanMoney(tokenName, gain + 5)
          this.addRecord({
            operator: tokenName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + tokenName + '连续签到成功'
          })
        } else {
          res.json({
            status: 200,
            message: '签到成功，奖励5心愿币'
          })
          this.addYuanMoney(nickName, gain)
          this.addRecord({
            operator: nickName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + nickName + '签到成功'
          })
        }
        this.addActiveNumber(tokenName, userInfo.continueSignTiems)
      }
    })
  }

  async getImagePath (req, res) {
    let path = await this.getPath(req, res)
    res.header("Content-Type", "application/json; charset=utf-8")
    if (path) {
      res.json({
        status: 200,
        message: '上传图片成功',
        data: path
      })
    }
  }
}

export default new User()
