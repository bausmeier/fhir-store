'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const tap = require('tap')
const sinon = require('sinon')

tap.test('delete', (t) => {
  const repo = sinon.createStubInstance(Repo)
  const store = new Store({
    base: 'http://localhost/',
    repo
  })

  t.beforeEach((next) => {
    repo.deleteResource.yields(new Error('Not stubbed'))
    next()
  })

  t.afterEach((next) => {
    setTimeout(() => {
      repo.deleteResource.reset()
      next()
    })
  })

  t.test('should call the repo delete with the correct parameters', (t) => {
    repo.deleteResource.withArgs('Patient', '1', sinon.match.func).yields(null)
    store.delete('Patient', '1', (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('should handle errors from the repo delete function', (t) => {
    repo.deleteResource.withArgs('Encounter', '2', sinon.match.func).yields(new Error('boom'))
    store.delete('Encounter', '2', (err) => {
      t.type(err, Error)
      t.equal(err.message, 'boom')
      t.end()
    })
  })

  t.end()
})
