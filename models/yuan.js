'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const yuanSchema = new Schema({
  id: Number,
  status: Number, // 1审核中 2待领取 3 进行中 4结束 5 关闭
  title: String, // 心愿标题
  des: String, // 心愿描述
  createdBy: String, // 创建人
  accectedBy: String, // 执行人
  createdTime: String, // 创建时间
  finishedTime: String, // 完成时间
  reopenTime: String, // 重开时间
  type: String, // 0 心愿任务 1 双人任务
  progress: {
    type: Number,
    default: 0 // 双人进度 默认0 1 完成1人 2 完成2人
  },
  amount: String, //任务心愿币
  daojuId: {
    type: Number,
    default: 0
  }, // 道具Id
  operationText: Array // 操作日志
})

const Yuan = mongoose.model('Yuan', yuanSchema)

export default Yuan