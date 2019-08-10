'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const activitySchema = new Schema({
  // type1  九宫格抽奖活动： 女5男4 微信私发
  startTime: String, // 开始时间
  endTime: String, // 结束时间
  src: String, // 活动图
  des: String, // 活动描述
  type: Number,
  id: Number,
  result: String
})

const Activity = mongoose.model('Activity', activitySchema)

export default Activity