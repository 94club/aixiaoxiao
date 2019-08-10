'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const yuanSchema = new Schema({
  id: Number,
  status: Number, // 1审核中 2 进行中 3结束 4 重开
  title: String, // 心愿标题
  des: String, // 心愿描述
  createdBy: String, // 创建人
  finishedBy: String, // 执行人
  createdTime: String, // 创建时间
  finishedTime: String, // 完成时间
  reopenTime: String, // 重开时间
  reopenDes: String, // 重开理由
  type: String, // 1心愿任务 2 双人任务 3特殊任务
  amount: String, //任务心愿币
  useDaoju: Boolean, // 是否使用道具
  daojuId: String // 道具Id
})

const Yuan = mongoose.model('Yuan', yuanSchema)

export default Yuan