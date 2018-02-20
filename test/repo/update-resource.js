'use strict'

const {ConflictError} = require('fhir-errors')
const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('updateResource', common.testWithRepo((t, repo) => {
  t.test('should create the resource if it does not exist', async (t) => {
    const resource = common.generatePatient()
    const {resource: returnedResource, info: updateInfo} = await repo.updateResource(resource)
    t.deepEqual(returnedResource, resource)
    t.deepEqual(updateInfo, {
      created: true,
      updated: false
    })

    const query = {
      resourceType: resource.resourceType,
      id: resource.id
    }
    const updatedResource = await repo._db.collection('resources').findOne(query)
    t.match(updatedResource, resource)
  })

  t.test('should update the resource if it exists', async (t) => {
    const existingResource = common.generatePatient()
    const resource = Object.assign(common.generatePatient(), {id: existingResource.id})
    await repo._db.collection('resources').insertOne(existingResource)

    const {resource: returnedResource, info: updateInfo} = await repo.updateResource(resource)
    t.deepEqual(returnedResource, resource)
    t.deepEqual(updateInfo, {
      created: false,
      updated: true
    })

    const query = {
      resourceType: resource.resourceType,
      id: resource.id
    }
    const updatedResource = await repo._db.collection('resources').findOne(query)
    t.match(updatedResource, resource)
  })

  t.test('should insert the updated resource into the \'versions\' collection', async (t) => {
    const resource = common.generatePatient()
    const {resource: returnedResource} = await repo.updateResource(resource)
    t.deepEqual(returnedResource, resource)

    const query = {
      resourceType: resource.resourceType,
      id: resource.id,
      'meta.versionId': resource.meta.versionId
    }
    const updatedResource = await repo._db.collection('versions').findOne(query)
    t.match(updatedResource, resource)
  })

  t.test('should not create the resource if the ifMatch option is *', async (t) => {
    const resource = common.generatePatient()
    try {
      await repo.updateResource(resource, {ifMatch: '*'})
      t.fail('updateResource should throw')
    } catch (err) {
      t.type(err, ConflictError)
      t.equal(err.message, `Patient with id ${resource.id} does not match`)
    }
  })

  t.test('should update the resource if the ifMatch option matches the version id', async (t) => {
    const existingResource = common.generatePatient()
    await repo._db.collection('resources').insertOne(existingResource)

    const resource = Object.assign(common.generatePatient(), {id: existingResource.id})
    const {resource: returnedResource} = await repo.updateResource(resource, {ifMatch: existingResource.meta.versionId})
    t.deepEqual(returnedResource, resource)

    const query = {
      resourceType: resource.resourceType,
      id: resource.id
    }
    const updatedResource = await repo._db.collection('resources').findOne(query)
    t.match(updatedResource, resource)
  })

  t.test('should return a conflict error if the ifMatch option does not match the version id', async (t) => {
    const resource = common.generatePatient()
    try {
      await repo.updateResource(resource, {ifMatch: uuid()})
      t.fail('updateResource should throw')
    } catch (err) {
      t.type(err, ConflictError)
      t.equal(err.message, `Patient with id ${resource.id} does not match`)
    }
  })

  t.end()
}))
