'use strict'

const common = require('../common')
const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const ValidationError = require('../../lib/errors/validation')
const sinon = require('sinon')
const tap = require('tap')

const resourceToUpdate = common.generatePatient()

const expectedResourceMatcher = sinon.match(
  Object.assign({}, resourceToUpdate, {
    meta: sinon.match({
      versionId: sinon.match.string,
      lastUpdated: sinon.match.instanceOf(Date)
    })
  })
)

const updatedResource = Object.assign({}, resourceToUpdate)

tap.test('update', (t) => {
  const repo = sinon.createStubInstance(Repo)

  const store = new Store({
    base: 'http://localhost/',
    repo: repo
  })

  t.beforeEach((next) => {
    repo.createResource.yields(new Error('Not stubbed'))
    repo.updateResource.yields(new Error('Not stubbed'))
    next()
  })

  t.afterEach((next) => {
    setTimeout(() => {
      repo.createResource.reset()
      repo.updateResource.reset()
      next()
    })
  })

  t.test('should return an error when the resource is falsy', (t) => {
    store.update(null, (err) => {
      t.type(err, ValidationError)
      t.end()
    })
  })

  t.test('should return an error when the resource has no id', (t) => {
    store.update({resourceType: 'Patient'}, (err) => {
      t.type(err, ValidationError)
      t.end()
    })
  })

  t.test('should return an error when the resource has no resource type', (t) => {
    store.update({id: '1'}, (err) => {
      t.type(err, ValidationError)
      t.end()
    })
  })

  t.test('should call updateResource and return the result when no options are provided', (t) => {
    const updateInfo = {
      created: false,
      updated: true
    }
    repo.updateResource.withArgs(expectedResourceMatcher, null, sinon.match.func).yields(null, updatedResource, updateInfo)

    const resource = Object.assign({}, resourceToUpdate)
    store.update(resource, (err, returnedResource, returnedInfo) => {
      t.error(err)
      t.equal(returnedResource, updatedResource)
      t.deepEqual(returnedInfo, updateInfo)
      t.end()
    })
  })

  t.test('should call createResource and return the result when the ifNoneMatch option is *', (t) => {
    repo.createResource.withArgs(expectedResourceMatcher, sinon.match.func).yields(null, updatedResource)

    const resource = Object.assign({}, resourceToUpdate)
    store.update(resource, {ifNoneMatch: '*'}, (err, returnedResource) => {
      t.error(err)
      t.equal(returnedResource, updatedResource)
      t.end()
    })
  })

  t.test('should call updateResource and pass through the options when they are provided', (t) => {
    const options = {ifMatch: '*'}
    repo.updateResource.withArgs(expectedResourceMatcher, sinon.match(options), sinon.match.func).yields(null, updatedResource)

    const resource = Object.assign({}, resourceToUpdate)
    store.update(resource, options, (err, returnedResource) => {
      t.error(err)
      t.equal(returnedResource, updatedResource)
      t.end()
    })
  })

  t.end()
})
