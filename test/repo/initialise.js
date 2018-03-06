'use strict'

const Repo = require('../../lib/repo')
const tap = require('tap')
const {MongoClient, Db} = require('mongodb')

tap.test('initialise repo', async t => {
  t.test('should set the correct internal fields', async t => {
    const repo = new Repo({url: 'mongodb://localhost', name: 'fhir-store-test'})
    await repo.initialise()
    t.equal(repo._initialised, true)
    t.type(repo._client, MongoClient)
    t.type(repo._db, Db)

    // Close the repo so that the test doesn't hang
    await repo.close()
  })

  t.test('should return correct values for isInitialised', async t => {
    const repo = new Repo({url: 'mongodb://localhost', name: 'fhir-store-test'})

    t.equal(repo.isInitialised(), false)
    await repo.initialise()
    t.equal(repo.isInitialised(), true)

    // Close the repo so that the test doesn't hang
    await repo.close()
  })

  t.test('should throw if already initialised', async t => {
    const repo = new Repo({url: 'mongodb://localhost', name: 'fhir-store-test'})

    await repo.initialise()
    try {
      await repo.initialise()
      t.fail('initialise should have thrown')
    } catch (err) {
      t.type(err, Error)
      t.equal(err.message, 'Already initialised')
    }

    // Close the repo so that the test doesn't hang
    await repo.close()
  })
})
