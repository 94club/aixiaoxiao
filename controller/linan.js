import Base from './base';

import JobModel from '../models/job'
import AdminModel from '../models/admin'
import constant from '../constant/constant'
import dateAndTime from 'date-and-time'
import jsonwebtoken from 'jsonwebtoken'
import redisManager from '../config/redis'

class Admin extends Base {
  constructor () {
    super()
    this.login = this.login.bind(this)
    this.getJob = this.getJob.bind(this)
    this.addJob = this.addJob.bind(this)
    this.updateJob = this.updateJob.bind(this)
  }
  
  async login (req, res) {
    // let reqInfo = req.body
    // let {username, pwd} = reqInfo
    // try {
    //   if (!username) {
    //     throw new Error('用户不能为空')
    //   }else if (!pwd) {
    //     throw new Error('密码不能为空')
    //   }
    // } catch (err) {
    //   res.json({
    //     status: 0,
    //     message: err.message
    //   })
    //   return
    // }
    // 先查一遍看看是否存在
    let userInfo = await AdminModel.findOne({username: 'linan', pwd: '!qaz123'}, {'_id': 0, '__v': 0})
    let token = jsonwebtoken.sign({username: 'linan'}, constant.secretKey)
    let dateTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    if (userInfo) {
      // 用户已存在 去登录
      redisManager.set(token, 'linan')
      res.json({
        status: 200,
        message: '登录成功',
        data: {
          token,
          data: {
            name: 'linan'
          }
        }
      })
      // this.addRecord({
      //   operator: username,
      //   createTime: dateTime,
      //   opertionText: username + '登录成功'
      // })
    } else {
      let newUser = {
        username: 'linan',
        pwd: '!qaz123',
        createTime: dateTime,
        id: 1
      }
      try {
        AdminModel.create(newUser, (err, userInfo) => {
          if (err) {
            res.json({
              status: 0,
              message: '注册失败'
            })
          } else {
            if (userInfo) {
              redisManager.set(token, 'linan')
              res.json({
                status: 200,
                message: '注册成功',
                data: {
                  token,
                  data: {
                    name: 'linan'
                  }
                }
              })
              // this.addRecord({
              //   operator: username,
              //   createTime: dateTime,
              //   opertionText: '用户' + username + '被创建了'
              // })
            }
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

  async logout (req, res) {
    // 清楚redis中的token
    res.json({
      status: 200,
      message: '退出成功'
    })
    redisManager.remove(req)
  }

  async getUserInfo (req, res) {
    let username = req.user.username
    let userInfo = await AdminModel.findOne({username}, {'_id': 0, '__v': 0, 'pwd': 0})
    if (userInfo) {
      res.json({
        status: 200,
        data: userInfo,
        message: '获取信息成功'
      })
    } else {
      res.json({
        status: 0,
        message: '获取信息失败'
      })
    }
  }

  async getYuan (req, res) {
    let {pageSize, pageNo} = req.query
    try {
      if (!pageSize) {
        throw new Error('pageSize不能为空')
      } else if (!pageNo) {
        throw new Error('pageNo不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let yuanList = await YuanModel.find({}).sort({_id: -1}).limit(parseInt(pageSize)).skip((pageNo - 1) * pageSize)
    if (yuanList) {
      res.json({
        status: 200,
        data: yuanList,
        message: '查询道具成功'
      })
    } else {
      res.json({
        status: 0,
        message: '查询道具失败'
      })
    }
  }

  async getUser (req, res) {
    let {pageSize, pageNo} = req.query
    try {
      if (!pageSize) {
        throw new Error('pageSize不能为空')
      } else if (!pageNo) {
        throw new Error('pageNo不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let userList = await UserModel.find({}).sort({_id: -1}).limit(parseInt(pageSize)).skip((pageNo - 1) * pageSize)
    if (userList) {
      res.json({
        status: 200,
        data: userList,
        message: '查询道具成功'
      })
    } else {
      res.json({
        status: 0,
        message: '查询道具失败'
      })
    }
  }

  async updateJob (req, res) {
    // moneyArr 各自该加多少钱
    let {id} = req.body
    try {
      if (!id) {
        throw new Error('jobID不能为空')
      }
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
      return
    }
    let dateTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    try {
      // operationText.push({
      //   text: '管理员审核了心愿',
      //   time: dateTime
      // })
      JobModel.findOneAndUpdate({id}, {$set: {
        status: 2,
        updateTime: dateTime
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
          // this.addRecord({
          //   operator: req.user.username,
          //   createTime: dateTime,
          //   opertionText: '心愿 '+ yuanId +'被审核了'
          // })
          // this.addYuanMoney(finishedBy[0], moneyArr[0])
          // this.addYuanMoney(finishedBy[1], moneyArr[1])
        }
      })
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
    }
  }

  async addNotice (req, res) {
    let {des} = req.body
    try {
      if (!des) {
        throw new Error('描述不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let noticeList = await NoticeModel.find({})
    let newNotice = {
      des,
      id: noticeList.length + 1,
      createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    }
    try {
      NoticeModel.create(newNotice, (err) => {
        if (err) {
          res.json({
            status: 0,
            message: '添加失败'
          })
        } else {
          res.json({
            status: 200,
            message: '添加成功'
          })
          this.addRecord({
            operator: req.user.username,
            createTime: dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss"),
            opertionText: '用户' + req.user.username + '创建了公告'
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

  async getNotice (req, res) {
    let noticeList = await NoticeModel.find({})
    res.json({
      status: 200,
      data: noticeList,
      message: '请求公告成功'
    })
  }
  async addAcitivity (req, res) {}
  async getAcitivity (req, res) {}
  async addJob (req, res) {
    let {require, intro, area, salary, position} = req.body
    try {
      if (!require) {
        throw new Error('职位需求不能为空')
      } else if (!intro) {
        throw new Error('职位介绍不能为空')
      } else if (!area) {
        throw new Error('工作地点不能为空')
      } else if (!salary) {
        throw new Error('薪资不能为空')
      } else if (!position) {
        throw new Error('工作岗位不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let createTime = dateAndTime.format(new Date(), "YYYY/MM/DD HH:mm:ss")
    let jobList = await JobModel.find({})
    let newJob = {
      createTime,
      id: jobList.length + 1,
      require,
      intro,
      area,
      salary,
      position
    }
    try {
      JobModel.create(newJob, (err, info) => {
        if (err) {
          res.json({
            status: 0,
            message: '添加失败'
          })
          return
        } 
        if (info) {
          res.json({
            status: 200,
            message: '添加成功'
          })
          // this.addRecord({
          //   operator: req.user.username,
          //   createTime,
          //   opertionText: '用户' + req.user.username + '创建了道具'
          // })
        }
      })
    } catch (err) {
      res.json({
        status: 0,
        message: err.message
      })
    }
  }
  async getJob (req, res) {
    let {pageSize, pageNo, status} = req.query
    try {
      if (!pageSize) {
        throw new Error('pageSize不能为空')
      } else if (!pageNo) {
        throw new Error('pageNo不能为空')
      }
    } catch (error) {
      res.json({
        status: 0,
        message: error.message
      })
      return
    }
    let jobList = await JobModel.find({status}, {'_id': 0, '__v': 0}).sort({_id: -1})
    // .limit(parseInt(pageSize)).skip((pageNo - 1) * pageSize)
    let list = jobList.slice((pageNo - 1) * pageSize, pageNo * pageSize)
    if (jobList) {
      res.json({
        status: 200,
        data: {
          count: jobList.length,
          list
        },
        message: '查询成功'
      })
    } else {
      res.json({
        status: 0,
        message: '查询失败'
      })
    }
  }
  async startSchedule (req, res) {}
}

export default new Admin()
