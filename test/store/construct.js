'use strict'

const tap = require('tap')
const Store = require('../../lib/store')
const Repo = require('../../lib/repo')

tap.test('construct store', async t => {
  t.test('should throw if base is not provided', async t => {
    const repo = Object.create(Repo.prototype)

    try {
      // eslint-disable-next-line no-new
      new Store({repo})
      t.fail('new should have thrown')
    } catch (err) {
      t.type(err, Error)
      t.equal(err.message, 'base must be a non-empty string')
    }
  })

  t.test('should throw if base is an empty string', async t => {
    const repo = Object.create(Repo.prototype)

    try {
      // eslint-disable-next-line no-new
      new Store({base: '', repo})
      t.fail('new should have thrown')
    } catch (err) {
      t.type(err, Error)
      t.equal(err.message, 'base must be a non-empty string')
    }
  })

  t.test('should throw if the repo is not initialised', async t => {
    const repo = Object.create(Repo.prototype)

    try {
      // eslint-disable-next-line no-new
      new Store({base: 'http://localhost', repo})
      t.fail('new should have thrown')
    } catch (err) {
      t.type(err, Error)
      t.equal(err.message, 'repo must be initialised')
    }
  })

  t.test('should set correct internal properties', async t => {
    const base = 'http://localhost'
    const repo = Object.create(Repo.prototype)
    repo._initialised = true

    const store = new Store({base, repo})

    t.equal(store._base, base)
    t.equal(store._repo, repo)
  })
})
