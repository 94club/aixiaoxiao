import RecordModel from '../models/record'
import UserModel from '../models/user'
import DaojuModel from '../models/daoju'
import dateAndTime from 'date-and-time'


export default class Base {
  constructor () {
    this.addRecord = this.addRecord.bind(this)
    this.getRecord = this.getRecord.bind(this)
    this.addCpMoney = this.addCpMoney.bind(this)
    this.useDaoju = this.useDaoju.bind(this)
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
  useDaoju (id, nickName) {
    try {
      DaojuModel.updateOne({id}, {$set: {
        isUsed: true,
        useTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
      }}, (err) => {
        if (err) {
          console.log('日志写入失败')
        } else {
          this.addRecord({
            username: nickName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + nickName + '使用了道具卡' + id
          })
        }
      })
    } catch (error) {
      
    }
  }

  async addCpMoney (nickName, gain) {
    let userInfo = await UserModel.findOne({nickName})
    UserModel.update({nickName}, {$set: {
      cpMoney: userInfo.cpMoney += gain
    }}, function (error) {
      if (error) {
        console.error('更新心愿币失败');
      } else {
        this.addRecord({
          username: nickName,
          createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
          opertionText: '用户' + nickName + '增加' + gain + '心愿币'
        })
      }
    })
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
          username: nickName,
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

}