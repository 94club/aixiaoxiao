'use strict'

import UserModel from '../models/user'
import RootModel from '../models/root'
import RecordModel from '../models/record'
import MoodModel from '../models/mood'
import dateAndTime from 'date-and-time'
import constant from '../constant/constant'
import jsonwebtoken from 'jsonwebtoken'
import redisManager from '../config/redis'
const request = require('request')
import base from './base'

class User extends base{
  constructor () {
    super()
    this.login = this.login.bind(this)
    this.rootLogin = this.rootLogin.bind(this)
    this.getUserInfo = this.getUserInfo.bind(this)
    this.getRecord = this.getRecord.bind(this)
    this.logout = this.logout.bind(this)
    this.saveMood = this.saveMood.bind(this)
    this.getMood = this.getMood.bind(this)
    this.addCpMoney = this.addCpMoney.bind(this)
    this.updateUserInfo = this.updateUserInfo.bind(this)
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
          let token
          // 先查一遍看看是否存在
          if (userInfo) {
            token = jsonwebtoken.sign({
              nickName: userInfo.nickName
            }, constant.secretKey)
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
                console.log({
                  username: userInfo.nickName,
                  createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
                  opertionText: userInfo.des + '' + userInfo.nickName + '登录成功'
                })
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
                avatarUrl: 'public/images/logo.jpg',
                openId,
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
                    redisManager.set(token, name)
                    res.json({
                      status: 200,
                      message: '注册成功',
                      data: {token}
                    })
                    this.addRecord({
                      username: name,
                      createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
                      opertionText: '用户' + name + '被创建了'
                    })
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
    let userInfo = await UserModel.findOne({nickName: req.user.nickName}, {'_id': 0, '__v': 0, 'password': 0})
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
        message: '用户查询失败，请联系管理员'
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

  async saveMood (req, res) {
    let reqInfo = req.body
    let moodList = await MoodModel.find({})
    let {des, imageStrList, videoPath} = reqInfo
    let nickName = req.user.nickName
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
      createBy: nickName,
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
          this.addCpMoney(nickName, gain)
          this.addRecord({
            username: nickName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + nickName + '被创建了心愿，获得了' + gain + '心愿币'
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
    let nickName = req.user.nickName
    let userInfo = await UserModel.findOne({nickName})
    let gain = 0
    let lastSignTime = ''
    if (userInfo.lastSignTime) {
      lastSignTime = new Date().getTime()
      let now = lastSignTime - new Date(userInfo.lastSignTime).getTime()
      if (now < 24 * 60 * 60 * 1000) {
        userInfo.continueSignTiems++
        gain = userInfo.continueSignTiems % 7 * 5
        userInfo.cpMoney+=gain
      } else {
        userInfo.continueSignTiems = 1
      }
    } else {
      userInfo.continueSignTiems = 1
    }
    UserModel.update({nickName}, {$set: {
      cpMoney: userInfo.cpMoney+=5,
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
          this.addRecord({
            username: nickName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + nickName + '连续签到成功，奖励' + (gain + 5) + '心愿币'
          })
        } else {
          res.json({
            status: 200,
            message: '签到成功，奖励5心愿币'
          })
          this.addRecord({
            username: nickName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + nickName + '签到成功，奖励5心愿币'
          })
        }
      }
    })
  }

  async updateUserInfo (req, res) {
    let {nickName, wechat} = req.body
    try {
      if (!nickName && !wechat) {
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
      let userInfo = await UserModel.findOne({nickName})
      UserModel.updateOne({nickName}, {$set: {
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
            username: nickName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + nickName + '修改昵称'
          })
        }
      })
    }
    if (wechat) {
      UserModel.updateOne({wechat}, {$set: {
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
            username: req.user.nickName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + req.user.nickName + '修改微信号'
          })
        }
      })
    }
  }
  async addCpMoney (nickName, gain) {
    let userInfo = await UserModel.findOne({nickName})
    UserModel.update({nickName}, {$set: {
      cpMoney: userInfo.cpMoney += gain
    }}, function (error) {
      if (error) {
        console.error('更新心愿币失败');
      } else {
        console.error('更新心愿币');
      }
    })
  }
}

export default new User()
