const { getAll } = require('../services/activityLog')

const activityController = {
  getAll: (req, res) => {
    return res.json(getAll())
  },
}

module.exports = activityController
