'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userSchema = new Schema({
  cpName: String,
  cpMoney: Number, // 心愿币
  nickName: String,
  avatarUrl: String,
  city: String,
  province: String,
  country: String,
  language: String,
  nameChangeTimes: {
    type: Number,
    default: 1
  },
  activeNumber: Number, // 活跃指数
  lastSignTime: String, // 上一次签到时间
  signTimes: Number, // 签到天数
  maxSignTiems: Number, // 连续签到天数
  id: Number,
  des: String,
  gender: Number, // 性别 0：未知、1：男、2：女
  createTime: String,
  role: Number,  // 2会员 1管理员
  createBy: String // 0代表自己注册  **代表创建人id
})

const User = mongoose.model('User', userSchema)

export default User