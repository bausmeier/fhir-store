'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const common = require('../common')
const sinon = require('sinon')
const tap = require('tap')

tap.test('vread', (t) => {
  const repo = sinon.createStubInstance(Repo)

  const store = new Store({
    base: 'http://localhost/',
    repo: repo
  })

  t.beforeEach((next) => {
    repo.findResourceVersion.yields(new Error('Not stubbed'))
    next()
  })

  t.afterEach((next) => {
    setTimeout(() => {
      repo.findResourceVersion.reset()
      next()
    })
  })

  t.test('should call findResourceVersion and return the result', (t) => {
    const resource = common.generatePatient()
    repo.findResourceVersion.withArgs('Patient', '1', '9', sinon.match.func).yields(null, resource)

    store.vread('Patient', '1', '9', (err, result) => {
      t.error(err)
      t.deepEqual(result, resource)
      t.end()
    })
  })

  t.test('should handle errors from findResourceVersion', (t) => {
    repo.findResourceVersion.yields(new Error('Oops'))

    store.vread('Patient', '1', '9', (err, result) => {
      t.type(err, Error)
      t.equal(err.message, 'Oops')
      t.end()
    })
  })

  t.end()
})
