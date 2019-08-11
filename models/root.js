'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const rootSchema = new Schema({
  createTime: String,
  username: String,
  password: String,
  id: Number
})

const Root = mongoose.model('Root', rootSchema)

export default Root