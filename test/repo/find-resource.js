'use strict'

const {DeletedError, NotFoundError} = require('fhir-errors')
const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('findResource', common.testWithRepo((t, repo) => {
  t.test('should return a not found error if the resource is not found', (t) => {
    const id = uuid()
    repo.findResource('Patient', id, (err, returnedResource) => {
      t.type(err, NotFoundError)
      t.equal(err.message, `Patient with id ${id} not found`)
      t.end()
    })
  })

  t.test('should return a deleted error if the resource has been deleted', (t) => {
    const resource = common.generatePatient()
    repo._db.collection('versions').insertOne(resource, (err) => {
      t.error(err)
      repo.findResource(resource.resourceType, resource.id, (err, returnedResource) => {
        t.type(err, DeletedError)
        t.equal(err.message, `Patient with id ${resource.id} has been deleted`)
        t.end()
      })
    })
  })

  t.test('should return the resource if it exists', (t) => {
    const resource = common.generatePatient()
    repo._db.collection('resources').insertOne(resource, (err) => {
      t.error(err)
      repo.findResource(resource.resourceType, resource.id, (err, returnedResource) => {
        t.error(err)
        t.deepEqual(returnedResource, resource)
        t.end()
      })
    })
  })

  t.end()
}))
