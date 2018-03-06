'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const common = require('../common')
const sinon = require('sinon')
const tap = require('tap')

tap.test('read', async (t) => {
  const repo = sinon.createStubInstance(Repo)

  const store = new Store({
    base: 'http://localhost/',
    repo: repo
  })

  t.beforeEach(async () => {
    repo.findResource.rejects(new Error('Not stubbed'))
  })

  t.afterEach((next) => {
    setTimeout(() => {
      repo.findResource.reset()
      next()
    })
  })

  t.test('should call findResource and return the result', async (t) => {
    const resource = common.generatePatient()
    repo.findResource.withArgs('Patient', '1').resolves(resource)

    const result = await store.read('Patient', '1')
    t.deepEqual(result, resource)
  })

  t.test('should handle errors from findResource', async (t) => {
    repo.findResource.rejects(new Error('Oops'))

    try {
      await store.read('Patient', '1')
      t.fail('read should have thrown')
    } catch (err) {
      t.type(err, Error)
      t.equal(err.message, 'Oops')
    }
  })
})
