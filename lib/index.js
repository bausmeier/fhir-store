'use strict'

const Repo = require('./repo')
const Store = require('./store')

async function connect({base = 'http://localhost/', db}) {
  const repo = new Repo(db)
  await repo.initialise()
  return new Store({base, repo})
}

module.exports = exports = {
  connect
}
