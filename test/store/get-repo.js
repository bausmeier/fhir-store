'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const tap = require('tap')

tap.test('getRepo', (t) => {
  const repo = Object.create(Repo.prototype)

  const store = new Store({
    base: 'http://localhost/',
    repo
  })

  t.test('should return the underlying repo', (t) => {
    const returnedRepo = store.getRepo()
    t.equal(returnedRepo, repo)
    t.end()
  })

  t.end()
})
