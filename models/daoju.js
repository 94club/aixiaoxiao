'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const daojuSchema = new Schema({
  createTime: String, // 创建时间
  isUsed: {
    type: Boolean,
    default: false
  }, // 是否使用
  type: Number, // 1心愿币修改卡0.5倍 2心愿币修改卡2倍 3昵称修改卡 4 心愿换位卡
  des: String,
  amount: Number, // 数量
  ownerId: {
    type: Number,
    default: 0
  } // 0代表系统
})

const Daoju = mongoose.model('Daoju', daojuSchema)

export default Daoju