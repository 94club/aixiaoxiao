'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const adminSchema = new Schema({
  createTime: String, // 创建时间
  id: Number,
  username: String,
  pwd: String
})

const Admin = mongoose.model('Admin', adminSchema)

export default Admin