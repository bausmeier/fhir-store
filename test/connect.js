'use strict'

const FHIRStore = require('../')
const Store = require('../lib/store')
const sinon = require('sinon')
const tap = require('tap')
const {MongoClient, ReadPreference} = require('mongodb')

const REQUIRED_DB_OPTIONS = {
  url: 'mongodb://localhost/fhir-store-test'
}

tap.test('Connect', async (t) => {
  t.test('should pass through db url and name', async (t) => {
    const options = {db: REQUIRED_DB_OPTIONS}
    const store = await FHIRStore.connect(options)
    t.type(store, Store)
    t.equal(store._base, 'http://localhost/')

    // Close the store so that the test doesn't hang
    await store.close()
  })

  t.test('should have a default base url', async (t) => {
    const options = {db: REQUIRED_DB_OPTIONS}
    const store = await FHIRStore.connect(options)
    t.type(store, Store)
    t.equal(store._base, 'http://localhost/')

    // Close the store so that the test doesn't hang
    await store.close()
  })

  t.test('should accept a base url option', async (t) => {
    const options = {base: 'https://example.com/fhir/', db: REQUIRED_DB_OPTIONS}
    const store = await FHIRStore.connect(options)
    t.type(store, Store)
    t.equal(store._base, 'https://example.com/fhir/')

    // Close the store so that the test doesn't hang
    await store.close()
  })

  t.test('should pass db.options through to the database driver', async (t) => {
    sinon.spy(MongoClient, 'connect')

    const dbOptions = {
      w: 'majority',
      j: true,
      readConcern: {
        level: 'linearizable'
      },
      readPreference: ReadPreference.PRIMARY_PREFERRED
    }

    const options = {db: Object.assign({}, REQUIRED_DB_OPTIONS, {options: dbOptions})}
    const store = await FHIRStore.connect(options)
    t.equal(MongoClient.connect.callCount, 1)
    t.match(MongoClient.connect.firstCall.args[1], dbOptions)

    // Remove the spy
    MongoClient.connect.restore()
    // Close the store so that the test doesn't hang
    await store.close()
  })
})
