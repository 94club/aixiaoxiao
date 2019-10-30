'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const yuanSchema = new Schema({
  id: Number,
  status: Number, // 1进行中 2审核中 3完成
  des: String, // 心愿描述
  createdBy: String, // 创建人
  finishedBy: {
    type: Array,
    default: []
  }, // 执行人
  createdTime: String, // 创建时间
  checkTime: String, // 审核时间
  finishedTime: String, // 完成时间
  type: String, // 1 系统任务 2 双人任务 3 对方任务
  amount: String, //任务心愿币
  daojuId: {
    type: Number,
    default: 1
  }, // 道具Id
  operationText: Array // 操作日志
})

const Yuan = mongoose.model('Yuan', yuanSchema)

export default Yuan