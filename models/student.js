'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const studentSchema = new Schema({
  // type1  九宫格抽奖活动： 女5男4 微信私发
  num: String,
  time: String,
  phone: String,
  nickName: String
})

const Student = mongoose.model('Student', studentSchema)

export default Student