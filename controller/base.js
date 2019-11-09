import RecordModel from '../models/record'
import UserModel from '../models/user'
import dateAndTime from 'date-and-time'


export default class Base {
  constructor () {
    this.addRecord = this.addRecord.bind(this)
    this.addYuanMoney = this.addYuanMoney.bind(this)
    this.getRecord = this.getRecord.bind(this)
    this.addActiveNumber = this.addActiveNumber.bind(this)
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

  async addActiveNumber (nickName, gain) {
    let userInfo = await UserModel.findOne({nickName})
    UserModel.update({nickName}, {$set: {
      activeNumber: userInfo.activeNumber += gain
    }}, function (error) {
      if (error) {
        console.error('更新活跃度失败');
      } else {
        this.addRecord({
          operator: nickName,
          createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
          opertionText: '用户' + nickName + '增加' + gain + '活跃度'
        })
      }
    })
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

  async addYuanMoney (id, gain) {
    try {
      if (!id) {
        throw new Error('id不能为空')
      } else if (!parseInt(gain)) {
        throw new Error('金额要大于0')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    let userInfo = await UserModel.findOne({id})
    try {
      UserModel.updateOne({id}, {$set: {
        cpMoney: userInfo.cpMoney += gain
      }}, (err) => {
        if (err) {
          res.json({
            status: 0,
            message: '更新失败'
          })
        } else {
          res.json({
            status: 200,
            message: '更新成功'
          })
          this.addRecord({
            operator: req.user.username,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + userInfo.nickName + '更新了心愿币' + gain
          })
        }
      })
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
    }
  }
}