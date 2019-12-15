'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const jobSchema = new Schema({
  createTime: String, // 创建时间
  updateTime: String, // 创建时间
  id: Number,
  require: String, // 职位需求
  intro: String, // 职位介绍
  area: String, // 工作地点
  salary: String, // 薪资
  position: String, // 职位名称
  status: { // 1 发布  2 关闭
    default: 1,
    type: Number
  }
})

const Job = mongoose.model('Job', jobSchema)

export default Job