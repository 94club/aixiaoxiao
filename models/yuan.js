'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const yuanSchema = new Schema({
  id: Number,
  status: {
    type: Number,
    default: 1
  }, // 1进行中 2待审核 完成 
  des: String, // 心愿描述
  createdBy: String, // 创建人
  finishedBy: {
    type: Array,
    default: []
  }, // 执行人
  createTime: String, // 创建时间
  checkTime: String, // 审核时间
  submitTime: {
    type: Array,
    default: []
  }, // 提交完成时间
  type: Number, // 1 系统任务 2 双人任务 3 对方 4 自己    双人任务判断length===2 进入审核
  amount: Number, //任务心愿币
  daojuArr: { // 审核时使用
    type: Array,
    default: []
  }, // 道具Id
  operationText: Array // 操作日志
})

const Yuan = mongoose.model('Yuan', yuanSchema)

export default Yuan