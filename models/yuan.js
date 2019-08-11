'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const yuanSchema = new Schema({
  id: Number,
  status: Number, // 1审核中 2 进行中 3结束 4 重开5 关闭
  title: String, // 心愿标题
  des: String, // 心愿描述
  createdBy: String, // 创建人
  accectedBy: String, // 执行人
  createdTime: String, // 创建时间
  finishedTime: String, // 完成时间
  reopenTime: String, // 重开时间
  type: String, // 0心愿任务 1 双人任务 2特殊任务
  amount: String, //任务心愿币
  daojuId: {
    type: Number,
    default: 0
  }, // 道具Id
  operationText: Array // 操作日志
})

const Yuan = mongoose.model('Yuan', yuanSchema)

export default Yuan