'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const common = require('../common')
const sinon = require('sinon')
const tap = require('tap')

tap.test('read', (t) => {
  const repo = sinon.createStubInstance(Repo)

  const store = new Store({
    base: 'http://localhost/',
    repo: repo
  })

  t.beforeEach((next) => {
    repo.findResource.yields(new Error('Not stubbed'))
    next()
  })

  t.afterEach((next) => {
    setTimeout(() => {
      repo.findResource.reset()
      next()
    })
  })

  t.test('should call findResource and return the result', (t) => {
    const resource = common.generatePatient()
    repo.findResource.withArgs('Patient', '1', sinon.match.func).yields(null, resource)

    store.read('Patient', '1', (err, result) => {
      t.error(err)
      t.deepEqual(result, resource)
      t.end()
    })
  })

  t.test('should handle errors from findResource', (t) => {
    repo.findResource.yields(new Error('Oops'))

    store.read('Patient', '1', (err, result) => {
      t.type(err, Error)
      t.equal(err.message, 'Oops')
      t.end()
    })
  })

  t.end()
})
