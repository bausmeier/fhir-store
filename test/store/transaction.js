'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const ValidationError = require('../../lib/errors/validation')
const bundleCreator = require('../../lib/bundle')
const common = require('../common')
const sinon = require('sinon')
const tap = require('tap')
const uuid = require('uuid/v1')

function generateBundle (resources = []) {
  return {
    resourceType: 'Bundle',
    title: 'Transaction Results',
    updated: new Date(),
    id: `urn:uuid:${uuid()}`,
    link: [
      {
        rel: 'fhir-base',
        href: 'http://localhost/'
      }
    ],
    totalResults: resources.length,
    entry: resources.map((resource) => {
      return {
        title: `${resource.resourceType} Resource`,
        id: `http://localhost/${resource.resourceType}/${resource.id}`,
        updated: new Date(),
        content: resource
      }
    })
  }
}

tap.test('Transaction', (t) => {
  const repo = sinon.createStubInstance(Repo)

  const store = new Store({
    base: 'http://localhost/',
    repo
  })

  t.beforeEach((next) => {
    repo.updateResources.yields(new Error('Not stubbed'))
    sinon.stub(bundleCreator, 'createBundle').throws(new Error('Not stubbed'))
    next()
  })

  t.afterEach((next) => {
    setTimeout(() => {
      repo.updateResources.reset()
      bundleCreator.createBundle.restore()
      next()
    })
  })

  t.test('should return an empty bundle when there are no entries in the transaction', (t) => {
    const transaction = {entry: []}

    const expectedBundle = generateBundle()

    bundleCreator.createBundle.withArgs('http://localhost/', 'Transaction Results', sinon.match([])).returns(expectedBundle)

    store.transaction(transaction, (err, bundle) => {
      t.error(err)
      t.deepEqual(bundle, expectedBundle)
      t.end()
    })
  })

  t.test('should return a validation error when there are entries without ids', (t) => {
    const transaction = {
      entry: [
        {
          title: 'Patient without id',
          content: common.generatePatient()
        }
      ]
    }

    store.transaction(transaction, (err) => {
      t.type(err, ValidationError)
      t.equal(err.message, 'Entries must have non-transient ids')
      t.end()
    })
  })

  t.test('should return a validation error when there are entries with transient ids', (t) => {
    const transaction = {
      entry: [
        {
          title: 'Patient with transient id',
          id: 'cid:d70267ce-0da4-48d9-8272-201739e82414',
          content: common.generatePatient()
        }
      ]
    }

    store.transaction(transaction, (err) => {
      t.type(err, ValidationError)
      t.equal(err.message, 'Entries must have non-transient ids')
      t.end()
    })
  })

  t.test('should return a validation error when there are entries with invalid an resource', (t) => {
    const transaction = {
      entry: [
        {
          title: 'Resource with missing resource type',
          id: 'http://localhost/Patient/1',
          content: {
            id: '1'
          }
        }
      ]
    }

    store.transaction(transaction, (err) => {
      t.type(err, ValidationError)
      t.equal(err.message, 'Invalid resource in entry http://localhost/Patient/1')
      t.end()
    })
  })

  t.test('should handle errors from repo', (t) => {
    const transaction = {
      entry: [
        {
          title: 'Patient',
          id: 'http://localhost/Patient/1',
          content: {
            resourceType: 'Patient',
            id: '1'
          }
        }
      ]
    }

    repo.updateResources.yields(new Error('boom'))

    store.transaction(transaction, (err) => {
      t.type(err, Error)
      t.equal(err.message, 'boom')
      t.end()
    })
  })

  t.test('should return a resource bundle when the transaction is successful', (t) => {
    const resources = [
      {
        id: '1',
        resourceType: 'Patient',
        name: [
          {
            given: ['John']
          }
        ]
      },
      {
        id: '1',
        resourceType: 'Encounter',
        subject: {
          reference: 'Patient/1'
        }
      }
    ]

    const transaction = {
      entry: resources.map((resource) => {
        return {
          title: resource.resourceType,
          id: `http://localhost/${resource.resourceType}/${resource.id}`,
          content: resource
        }
      })
    }

    repo.updateResources.withArgs(resources.map(sinon.match), sinon.match.func).callsFake((resources, callback) => {
      // Just return the resources for simplicity
      callback(null, resources)
    })

    const expectedBundle = generateBundle(resources)

    bundleCreator.createBundle.withArgs('http://localhost/', 'Transaction Results', resources.map(sinon.match)).returns(expectedBundle)

    store.transaction(transaction, (err, bundle) => {
      t.error(err)
      t.deepEqual(bundle, expectedBundle)
      t.end()
    })
  })

  t.end()
})
