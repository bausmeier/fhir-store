'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const {ValidationError} = require('fhir-errors')
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

tap.test('Transaction', async (t) => {
  const repo = sinon.createStubInstance(Repo)

  const store = new Store({
    base: 'http://localhost/',
    repo
  })

  t.beforeEach(async () => {
    repo.updateResources.rejects(new Error('Not stubbed'))
    sinon.stub(bundleCreator, 'createBundle').rejects(new Error('Not stubbed'))
  })

  t.afterEach((next) => {
    setTimeout(() => {
      repo.updateResources.reset()
      bundleCreator.createBundle.restore()
      next()
    })
  })

  t.test('should return an empty bundle when there are no entries in the transaction', async (t) => {
    const transaction = {entry: []}

    const expectedBundle = generateBundle()

    bundleCreator.createBundle.withArgs('http://localhost/', 'Transaction Results', sinon.match([])).returns(expectedBundle)

    const bundle = await store.transaction(transaction)
    t.deepEqual(bundle, expectedBundle)
  })

  t.test('should return a validation error when there are entries without ids', async (t) => {
    const transaction = {
      entry: [
        {
          title: 'Patient without id',
          content: common.generatePatient()
        }
      ]
    }

    try {
      await store.transaction(transaction)
      t.fail('transaction should have thrown')
    } catch (err) {
      t.type(err, ValidationError)
      t.equal(err.message, 'Entries must have non-transient ids')
    }
  })

  t.test('should return a validation error when there are entries with transient ids', async (t) => {
    const transaction = {
      entry: [
        {
          title: 'Patient with transient id',
          id: 'cid:d70267ce-0da4-48d9-8272-201739e82414',
          content: common.generatePatient()
        }
      ]
    }

    try {
      await store.transaction(transaction)
      t.fail('transaction should have thrown')
    } catch (err) {
      t.type(err, ValidationError)
      t.equal(err.message, 'Entries must have non-transient ids')
    }
  })

  t.test('should return a validation error when there are entries with invalid an resource', async (t) => {
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

    try {
      await store.transaction(transaction)
      t.fail('transaction should have thrown')
    } catch (err) {
      t.type(err, ValidationError)
      t.equal(err.message, 'Invalid resource in entry http://localhost/Patient/1')
    }
  })

  t.test('should handle errors from repo', async (t) => {
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

    repo.updateResources.rejects(new Error('boom'))

    try {
      await store.transaction(transaction)
      t.fail('transaction should have thrown')
    } catch (err) {
      t.type(err, Error)
      t.equal(err.message, 'boom')
    }
  })

  t.test('should return a resource bundle when the transaction is successful', async (t) => {
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

    repo.updateResources.withArgs(resources.map(sinon.match)).resolves(resources)

    const expectedBundle = generateBundle(resources)

    bundleCreator.createBundle.withArgs('http://localhost/', 'Transaction Results', resources.map(sinon.match)).returns(expectedBundle)

    const bundle = await store.transaction(transaction)
    t.deepEqual(bundle, expectedBundle)
  })
})
