import RecordModel from '../models/record'
import UserModel from '../models/user'
import dateAndTime from 'date-and-time'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

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
      console.log(error)
      return
    }
    let userInfo = await UserModel.findOne({id})
    try {
      UserModel.updateOne({id}, {$set: {
        cpMoney: userInfo.cpMoney += gain
      }}, (err) => {
        if (err) {
          console.log('失败')
        } else {
          console.log('成功')
          this.addRecord({
            operator: userInfo.nickName,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + userInfo.nickName + '更新了心愿币' + gain
          })
        }
      })
    } catch (err) {
      console.log('失败')
    }
  }

  async getPath (req, res){
		return new Promise((resolve, reject) => {
			const form = formidable.IncomingForm();
      form.uploadDir = './public/img';
      // 如果没有就新建
      if (!fs.existsSync(form.uploadDir)) {
        fs.mkdirSync(form.uploadDir)
      }
			form.parse(req, async (err, fields, files) => {
        const hashName = (new Date().getTime() + Math.ceil(Math.random()*10000)).toString(16);
        console.log(fields)
        console.log(files.file.name)
				const extname = path.extname(files.file.name);
				if (!['.jpg', '.jpeg', '.png'].includes(extname)) {
					fs.unlinkSync(files.file.path);
					res.send({
						status: 0,
						type: 'ERROR_EXTNAME',
						message: '文件格式错误'
					})
					reject('上传失败');
					return 
				}
				const fullName = hashName + extname;
				const repath = './public/img/' + fullName;
				try{
					fs.renameSync(files.file.path, repath);
					// gm(repath)
					// .resize(200, 200, "!")
					// .write(repath, async (err) => {
					// 	// if(err){
					// 	// 	console.log('裁切图片失败');
					// 	// 	reject('裁切图片失败');
					// 	// 	return
					// 	// }
					// 	resolve(fullName)
          // })
          resolve('/img/' + fullName)
				}catch(err){
					console.log('保存图片失败', err);
					if (fs.existsSync(repath)) {
						fs.unlinkSync(repath);
					} else {
						fs.unlinkSync(files.file.path);
					}
					reject('保存图片失败')
				}
			});
		})
	}
}