'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const noticeSchema = new Schema({
  createTime: String,
  des: String,
  id: Number
})

const Notice = mongoose.model('Notice', noticeSchema)

export default Notice