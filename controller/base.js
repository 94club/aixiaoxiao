import RecordModel from '../models/record'
export default class Base {
  constructor () {
    this.addRecord = this.addRecord.bind(this)
  }

  async getRecord (req, res) {
    let recordInfo = await RecordModel.find({}, { '_id': 0, '__v': 0}).sort({_id: -1})
    if (recordInfo) {
      res.json({
        status: 200,
        message: '查询记录成功',
        data: recordInfo
      })
    } else {
      res.json({
        status: 0,
        message: '用户记录失败，请联系管理员'
      })
    }
  }
  
  addRecord (recordText) {
    try {
      RecordModel.create(recordText, (err) => {
        if (err) {
          console.log('日志写入失败')
        } else {
          console.log('日志写入成功')
        }
        console.log(recordText)
      })
    } catch (err) {
      console.log('日志写入catch失败')
    }
  }
}