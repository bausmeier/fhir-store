'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const tap = require('tap')
const sinon = require('sinon')

tap.test('Close', (t) => {
  const repo = sinon.createStubInstance(Repo)

  const store = new Store({
    base: 'http://localhost/',
    repo
  })

  t.beforeEach(async () => {
    repo.close.resolves()
  })

  t.afterEach((next) => {
    setTimeout(() => {
      repo.close.reset()
      next()
    })
  })

  t.test('should call repo close function', async (t) => {
    await store.close()
    t.equal(repo.close.callCount, 1)
  })

  t.end()
})
