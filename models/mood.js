'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const daojuSchema = new Schema({
  createTime: String,
  des: String, // 心情文字
  images: Array, // 图片
  videoPath: String, // 录音文件
  type: Number, // 1心愿币修改卡0.5倍 1心愿币修改卡2倍 1心愿币修改卡3倍 4昵称修改卡 5 心愿换位卡
  id: Number,
  createdBy: String,
  showOther: Boolean  
})

const Daoju = mongoose.model('Daoju', daojuSchema)

export default Daoju