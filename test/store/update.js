'use strict'

const common = require('../common')
const Repo = require('../../lib/repo')
const Store = require('../../lib/store')
const {ValidationError} = require('fhir-errors')
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

tap.test('update', async t => {
  const repo = sinon.createStubInstance(Repo)
  repo.isInitialised.returns(true)

  const store = new Store({
    base: 'http://localhost/',
    repo: repo
  })

  t.beforeEach(async () => {
    repo.createResource.rejects(new Error('Not stubbed'))
    repo.updateResource.rejects(new Error('Not stubbed'))
  })

  t.afterEach(next => {
    setTimeout(() => {
      repo.createResource.reset()
      repo.updateResource.reset()
      next()
    })
  })

  t.test('should return an error when the resource is falsy', async t => {
    try {
      await store.update(null)
      t.fail('update should have thrown')
    } catch (err) {
      t.type(err, ValidationError)
    }
  })

  t.test('should return an error when the resource has no id', async t => {
    try {
      await store.update({resourceType: 'Patient'})
      t.fail('update should have thrown')
    } catch (err) {
      t.type(err, ValidationError)
    }
  })

  t.test(
    'should return an error when the resource has no resource type',
    async t => {
      try {
        await store.update({id: '1'})
        t.fail('update should have thrown')
      } catch (err) {
        t.type(err, ValidationError)
      }
    }
  )

  t.test(
    'should call updateResource and return the result when no options are provided',
    async t => {
      const updateInfo = {
        created: false,
        updated: true
      }
      repo.updateResource
        .withArgs(expectedResourceMatcher)
        .resolves({resource: updatedResource, info: updateInfo})

      const resource = Object.assign({}, resourceToUpdate)
      const {
        resource: returnedResource,
        info: returnedInfo
      } = await store.update(resource)
      t.equal(returnedResource, updatedResource)
      t.deepEqual(returnedInfo, updateInfo)
    }
  )

  t.test(
    'should call createResource and return the result when the ifNoneMatch option is *',
    async t => {
      repo.createResource
        .withArgs(expectedResourceMatcher)
        .resolves({resource: updatedResource})

      const resource = Object.assign({}, resourceToUpdate)
      const {resource: returnedResource} = await store.update(resource, {
        ifNoneMatch: '*'
      })
      t.equal(returnedResource, updatedResource)
    }
  )

  t.test(
    'should call updateResource and pass through the options when they are provided',
    async t => {
      const options = {ifMatch: '*'}
      repo.updateResource
        .withArgs(expectedResourceMatcher, sinon.match(options))
        .resolves({resource: updatedResource})

      const resource = Object.assign({}, resourceToUpdate)
      const {resource: returnedResource} = await store.update(resource, options)
      t.equal(returnedResource, updatedResource)
    }
  )
})
