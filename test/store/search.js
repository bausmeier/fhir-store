'use strict'

const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const bundleCreator = require('../../lib/bundle')
const common = require('../common')
const sinon = require('sinon')
const tap = require('tap')
const uuid = require('uuid/v1')

function generateBundle (resources = []) {
  return {
    resourceType: 'Bundle',
    title: 'Search Results',
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

tap.test('Search', (t) => {
  const repo = sinon.createStubInstance(Repo)

  const store = new Store({base: 'http://localhost/', repo})

  t.beforeEach((next) => {
    repo.searchResources.rejects(new Error('Not stubbed'))
    sinon.stub(bundleCreator, 'createBundle').throws(new Error('Not stubbed'))
    next()
  })

  t.afterEach((next) => {
    setTimeout(() => {
      repo.searchResources.reset()
      bundleCreator.createBundle.restore()
      next()
    })
  })

  t.test('should correctly construct bundle', (t) => {
    repo.searchResources.withArgs('Patient', sinon.match({})).resolves({resources: [], count: 0})

    const expectedBundle = generateBundle()

    bundleCreator.createBundle.withArgs('http://localhost/', 'Search Results', sinon.match([]), 0).returns(expectedBundle)

    store.search('Patient', (err, bundle) => {
      t.error(err)
      t.deepEqual(bundle, expectedBundle)
      t.end()
    })
  })

  t.test('should correctly build bundle entries', (t) => {
    const resources = [
      common.generatePatient(),
      common.generatePatient(),
      common.generatePatient()
    ]
    repo.searchResources.withArgs('Patient', sinon.match({})).resolves({resources, count: 3})

    const expectedBundle = generateBundle(resources)

    bundleCreator.createBundle.withArgs('http://localhost/', 'Search Results', resources.map(sinon.match), resources.length).returns(expectedBundle)

    store.search('Patient', (err, bundle) => {
      t.error(err)
      t.deepEqual(bundle, expectedBundle)
      t.end()
    })
  })

  t.test('should pass through query options to repo', (t) => {
    const query = {
      _count: 10,
      page: 2,
      identifier: '16cd9ef0-e9a9-48a1-b015-b40923e17ddc'
    }
    repo.searchResources.withArgs('Practitioner', sinon.match(query)).resolves({resources: [], count: 0})

    const expectedBundle = generateBundle()

    bundleCreator.createBundle.withArgs('http://localhost/', 'Search Results', sinon.match([]), 0).returns(expectedBundle)

    store.search('Practitioner', query, (err, bundle) => {
      t.error(err)
      t.deepEqual(bundle, expectedBundle)
      const self = bundle.link.find((link) => link.rel === 'self')
      t.equal(self.href, 'http://localhost/Practitioner?_count=10&page=2&identifier=16cd9ef0-e9a9-48a1-b015-b40923e17ddc')
      t.end()
    })
  })

  t.test('should handle errors from repo', (t) => {
    repo.searchResources.withArgs('Encounter', sinon.match({})).rejects(new Error('boom'))

    store.search('Encounter', (err) => {
      t.type(err, Error)
      t.equal(err.message, 'boom')
      t.end()
    })
  })

  t.end()
})
