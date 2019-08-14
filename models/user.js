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
  avatarUrl: String,
  city: String,
  province: String,
  country: String,
  language: String,
  gender: Number, // 性别 0：未知、1：男、2：女
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
  }, // 签到天数
  maxSignTiems: {
    type: Number,
    default: 0
  }, // 连续签到天数
  id: Number,
  createTime: String,
  createBy: String // 0代表自己注册  **代表创建人id
})

const User = mongoose.model('User', userSchema)

export default User