'use strict'

import UserModel from '../models/user'
import RootModel from '../models/root'
import RecordModel from '../models/record'
import MoodModel from '../models/mood'
import dateAndTime from 'date-and-time'
import constant from '../constant/constant'
import jsonwebtoken from 'jsonwebtoken'
import redisManager from '../config/redis'

class User {
  constructor () {
    this.login = this.login.bind(this)
    this.rootLogin = this.rootLogin.bind(this)
    this.getUserInfo = this.getUserInfo.bind(this)
    this.getRecord = this.getRecord.bind(this)
    this.logout = this.logout.bind(this)
    this.saveMood = this.saveMood.bind(this)
    this.getMood = this.getMood.bind(this)
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
    let userInfo = await UserModel.findOne({username: req.user.username}, {'_id': 0, '__v': 0, 'password': 0})
    if (userInfo) {
      res.json({
        status: 200,
        message: '查询成功',
        data: userInfo
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
      createBy: req.username,
      createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
      id: moodList.length + 1
    }
    try {
      MoodModel.create(newMood, (err) => {
        if (err) {
          res.json({
            status: 0,
            message: '添加失败'
          })
        } else {
          redisManager.set(token, nickName)
          res.json({
            status: 200,
            message: '添加成功'
          })
          this.addRecord({
            username: req.username,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + username + '被创建了心愿'
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

  async getRecord (req, res) {
    let recordInfo = await RecordModel.find({}, { '_id': 0, '__v': 0}).sort({_id: -1})
    if (recordInfo) {
      res.json({
        status: 200,
        message: '查询记录成功',
        data: recordInfo
      })
    } else {
      res.json({
        status: 0,
        message: '用户记录失败，请联系管理员'
      })
    }
  }
  
  addRecord (recordText) {
    try {
      RecordModel.create(recordText, (err) => {
        if (err) {
          console.log('日志写入失败')
        } else {
          console.log('日志写入成功')
        }
        console.log(recordText)
      })
    } catch (err) {
      console.log('日志写入catch失败')
    }
  }
}

export default new User()
