'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const sinon = require('sinon')
const tap = require('tap')

tap.test('getRepo', async t => {
  const repo = sinon.createStubInstance(Repo)
  repo.isInitialised.returns(true)

  const store = new Store({
    base: 'http://localhost/',
    repo
  })

  t.test('should return the underlying repo', async t => {
    const returnedRepo = store.getRepo()
    t.equal(returnedRepo, repo)
  })
})
