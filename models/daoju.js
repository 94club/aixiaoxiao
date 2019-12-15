'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const daojuSchema = new Schema({
  createTime: String, // 创建时间
  isUsed: {
    type: Number,
    default: 1
  }, // 是否使用     1 没有使用  2使用了
  usedTime: {
    default: '',
    type: String
  }, // 使用时间
  des: String,
  id: Number,
  money: Number, // 购买所需心愿币
  ownerId: {
    type: Number,
    default: 0
  }, // 0代表系统
  ownerName: {
    default: '系统',
    type: String
  }
})

const Daoju = mongoose.model('Daoju', daojuSchema)

export default Daoju