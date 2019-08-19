import Base from './base';

const schedule = require('node-schedule');
import DaojuModel from '../models/daoju'
import dateAndTime from 'date-and-time'
import constant from '../constant/constant'
import jsonwebtoken from 'jsonwebtoken'
import redisManager from '../config/redis'

class Admin extends Base {
  constructor () {
    super()
    this.startSchedule = this.startSchedule.bind(this)
    this.addYuanMoney = this.addYuanMoney.bind(this)
    this.updateYuan = this.updateYuan.bind(this)
    this.addNotice = this.addNotice.bind(this)
    this.addAcitivity = this.addAcitivity.bind(this)
    this.addDaoju = this.addDaoju.bind(this)
    this.updateDaoju = this.updateDaoju.bind(this)
    this.login = this.login.bind(this)
    this.lgout = this.lgout.bind(this)
  }
  
  async login (req, res) {}
  async lgout (req, res) {}
  async addYuanMoney (req, res) {}
  async updateYuan (req, res) {}
  async addNotice (req, res) {}
  async addAcitivity (req, res) {}
  async addDaoju (req, res) {}
  async updateDaoju (req, res) {}
  async startSchedule (req, res) {}
}

export default new Admin()
