'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const moodSchema = new Schema({
  createTime: String,
  des: String, // 心情文字
  imageStrList: Array, // 图片
  videoPath: String, // 录音文件
  id: Number,
  createdBy: String,
  showOther: Boolean // 是否对TA可见
})

const Mood = mongoose.model('Mood', moodSchema)

export default Mood