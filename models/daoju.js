'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const daojuSchema = new Schema({
  createTime: String,
  isUsed: {
    type: Boolean,
    default: false
  }, // 是否使用
  type: Number, // 1心愿币修改卡0.5倍 1心愿币修改卡2倍 1心愿币修改卡3倍 4昵称修改卡 5 心愿换位卡
  des: String,
  id: Number,
  owner: String
})

const Daoju = mongoose.model('Daoju', daojuSchema)

export default Daoju