'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const recordSchema = new Schema({
    username: String,
    createTime: String,
    opertionText: String,
    type: {
      type: Number,
      default: 1 // 1默认日志 2 加钱  
    }
})

const Record = mongoose.model('Record', recordSchema)

export default Record