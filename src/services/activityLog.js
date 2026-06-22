const activities = []
const MAX = 50

function add(type, action, target) {
  activities.unshift({
    id: Date.now(),
    type,
    action,
    target,
    time: new Date().toISOString(),
  })
  if (activities.length > MAX) activities.length = MAX
}

function getAll() {
  return activities
}

module.exports = { add, getAll }
