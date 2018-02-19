'use strict'

const FHIRStore = require('../')
const Store = require('../lib/store')
const sinon = require('sinon')
const tap = require('tap')
const {MongoClient, ReadPreference} = require('mongodb')

const REQUIRED_OPTIONS = {
  db: {
    url: 'mongodb://localhost',
    name: 'fhir-store-test'
  }
}

tap.test('Connect', (t) => {
  t.test('should pass through db url and name', (t) => {
    const options = Object.assign({}, REQUIRED_OPTIONS)
    FHIRStore.connect(options, (err, store) => {
      t.error(err)
      t.type(store, Store)
      t.equal(store._base, 'http://localhost/')
      t.end()

      // Close the store so that the test doesn't hang
      store.close()
    })
  })

  t.test('should have a default base url', (t) => {
    const options = Object.assign({}, REQUIRED_OPTIONS)
    FHIRStore.connect(options, (err, store) => {
      t.error(err)
      t.type(store, Store)
      t.equal(store._base, 'http://localhost/')
      t.end()

      // Close the store so that the test doesn't hang
      store.close()
    })
  })

  t.test('should accept a base url option', (t) => {
    const options = Object.assign({}, REQUIRED_OPTIONS, {
      base: 'https://example.com/fhir/'
    })
    FHIRStore.connect(options, (err, store) => {
      t.error(err)
      t.type(store, Store)
      t.equal(store._base, 'https://example.com/fhir/')
      t.end()

      // Close the store so that the test doesn't hang
      store.close()
    })
  })

  t.test('should pass dbOptions through to the database driver', (t) => {
    sinon.spy(MongoClient, 'connect')

    const dbOptions = {
      w: 'majority',
      j: true,
      readConcern: {
        level: 'linearizable'
      },
      readPreference: ReadPreference.PRIMARY_PREFERRED
    }

    const options = Object.assign({}, REQUIRED_OPTIONS, {dbOptions})
    FHIRStore.connect(options, (err, store) => {
      t.error(err)
      t.equal(MongoClient.connect.callCount, 1)
      t.match(MongoClient.connect.firstCall.args[1], dbOptions)
      t.end()

      // Remove the spy
      MongoClient.connect.restore()
      // Close the store so that the test doesn't hang
      store.close()
    })
  })

  t.end()
})
