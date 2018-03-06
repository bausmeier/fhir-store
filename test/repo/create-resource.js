'use strict'

const {ConflictError} = require('fhir-errors')
const common = require('../common')
const tap = require('tap')

tap.test('createResource', common.testWithRepo(async (t, repo) => {
  t.test('should insert the resource into the \'resources\' collection', async (t) => {
    const resource = common.generatePatient()
    const {resource: returnedResource, info: updateInfo} = await repo.createResource(resource)
    t.deepEqual(returnedResource, resource)
    t.deepEqual(updateInfo, {
      created: true,
      updated: false
    })

    const query = {
      resourceType: resource.resourceType,
      id: resource.id
    }
    const createdResource = await repo._db.collection('resources').findOne(query)
    t.match(createdResource, resource)
  })

  t.test('should insert the resource into the \'versions\' collection', async (t) => {
    const resource = common.generatePatient()
    const {resource: returnedResource} = await repo.createResource(resource)
    t.deepEqual(returnedResource, resource)

    const query = {
      resourceType: resource.resourceType,
      id: resource.id,
      'meta.versionId': resource.meta.versionId
    }
    const createdResource = await repo._db.collection('versions').findOne(query)
    t.match(createdResource, resource)
  })

  t.test('should return a conflict error when the resource is a duplicate', async (t) => {
    const resource = common.generatePatient()

    await repo._db.collection('resources').insertOne(resource)

    try {
      await repo.createResource(resource)
      t.fail('createResource should have thrown')
    } catch (err) {
      t.type(err, ConflictError)
      t.equal(err.message, `Patient with id ${resource.id} already exists`)
    }
  })
}))
