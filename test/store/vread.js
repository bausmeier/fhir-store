'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const common = require('../common')
const sinon = require('sinon')
const tap = require('tap')

tap.test('vread', async (t) => {
  const repo = sinon.createStubInstance(Repo)

  const store = new Store({
    base: 'http://localhost/',
    repo: repo
  })

  t.beforeEach(async () => {
    repo.findResourceVersion.rejects(new Error('Not stubbed'))
  })

  t.afterEach((next) => {
    setTimeout(() => {
      repo.findResourceVersion.reset()
      next()
    })
  })

  t.test('should call findResourceVersion and return the result', async (t) => {
    const resource = common.generatePatient()
    repo.findResourceVersion.withArgs('Patient', '1', '9').resolves(resource)

    const result = await store.vread('Patient', '1', '9')
    t.deepEqual(result, resource)
  })

  t.test('should handle errors from findResourceVersion', async (t) => {
    repo.findResourceVersion.rejects(new Error('Oops'))

    try {
      await store.vread('Patient', '1', '9')
      t.fail('vread should have thrown')
    } catch (err) {
      t.type(err, Error)
      t.equal(err.message, 'Oops')
    }
  })
})
