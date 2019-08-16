const schedule = require('node-schedule');

class Admin {
  constructor () {
    this.startSchedule = this.startSchedule.bind(this)
  }
  
  async startSchedule (req, res) {}
}

export default new Admin()
