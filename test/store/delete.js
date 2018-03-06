'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const tap = require('tap')
const sinon = require('sinon')

tap.test('delete', async (t) => {
  const repo = sinon.createStubInstance(Repo)
  repo.isInitialised.returns(true)

  const store = new Store({
    base: 'http://localhost/',
    repo
  })

  t.beforeEach(async () => {
    repo.deleteResource.rejects(new Error('Not stubbed'))
  })

  t.afterEach((next) => {
    setTimeout(() => {
      repo.deleteResource.reset()
      next()
    })
  })

  t.test('should call the repo delete with the correct parameters', async (t) => {
    repo.deleteResource.resolves(null)
    await store.delete('Patient', '1')
    t.equal(repo.deleteResource.callCount, 1)
    t.assert(repo.deleteResource.calledWith('Patient', '1'))
  })

  t.test('should handle errors from the repo delete function', async (t) => {
    repo.deleteResource.withArgs('Encounter', '2').rejects(new Error('boom'))
    try {
      await store.delete('Encounter', '2')
      t.fail('delete should have thrown')
    } catch (err) {
      t.type(err, Error)
      t.equal(err.message, 'boom')
    }
  })
})
