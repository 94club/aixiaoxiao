'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userSchema = new Schema({
  cpName: {
    type: String,
    default: ''
  }, // 绑定对象
  cpMoney: {
    type: Number,
    default: 0
  }, // 心愿币
  nickName: String,
  // tokenName: String, // 因为nickName可以被修改，所以用一个tokenName
  openId: String, // 微信唯一标识
  wechat: {
    type: String,
    default: ''
  }, // 微信号
  nameChangeTimes: {
    type: Number,
    default: 1
  },
  isSignToday: Boolean, // 今天是否签到
  activeNumber: {
    type: Number,
    default: 0
  }, // 活跃指数
  lastSignTime: {
    type: String,
    default: ''
  }, // 上一次签到时间
  signTimes: {
    type: Number,
    default: 0
  }, // 总共签到天数
  continueSignTiems: {
    type: Number,
    default: 0
  }, // 连续签到天数
  id: Number,
  createTime: String,
  createBy: {
    type: Number,
    default: 1
  } // 1代表自己注册  2代表系统
})

const User = mongoose.model('User', userSchema)

export default User