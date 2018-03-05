'use strict'

const {DeletedError, NotFoundError} = require('fhir-errors')
const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('findResource', common.testWithRepo((t, repo) => {
  t.test('should return a not found error if the resource is not found', async (t) => {
    const id = uuid()
    try {
      await repo.findResource('Patient', id)
      t.fail('findResource should have thrown')
    } catch (err) {
      t.type(err, NotFoundError)
      t.equal(err.message, `Patient with id ${id} not found`)
    }
  })

  t.test('should return a deleted error if the resource has been deleted', async (t) => {
    const resource = common.generatePatient()
    await repo._db.collection('versions').insertOne(resource)

    try {
      await repo.findResource(resource.resourceType, resource.id)
      t.fail('findResource should have thrown')
    } catch (err) {
      t.type(err, DeletedError)
      t.equal(err.message, `Patient with id ${resource.id} has been deleted`)
    }
  })

  t.test('should return the resource if it exists', async (t) => {
    const resource = common.generatePatient()
    await repo._db.collection('resources').insertOne(resource)
    const returnedResource = await repo.findResource(resource.resourceType, resource.id)
    t.deepEqual(returnedResource, resource)
  })

  t.end()
}))
