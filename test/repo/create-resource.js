'use strict'

const {ConflictError} = require('fhir-errors')
const common = require('../common')
const tap = require('tap')

tap.test('createResource', common.testWithRepo((t, repo) => {
  t.test('should insert the resource into the \'resources\' collection', (t) => {
    const resource = common.generatePatient()
    repo.createResource(resource, (err, returnedResource, updateInfo) => {
      t.error(err)
      t.deepEqual(returnedResource, resource)
      t.deepEqual(updateInfo, {
        created: true,
        updated: false
      })

      const query = {
        resourceType: resource.resourceType,
        id: resource.id
      }
      repo._db.collection('resources').findOne(query, (err, createdResource) => {
        t.error(err)
        t.match(createdResource, resource)
        t.end()
      })
    })
  })

  t.test('should insert the resource into the \'versions\' collection', (t) => {
    const resource = common.generatePatient()
    repo.createResource(resource, (err, returnedResource) => {
      t.error(err)
      t.deepEqual(returnedResource, resource)

      const query = {
        resourceType: resource.resourceType,
        id: resource.id,
        'meta.versionId': resource.meta.versionId
      }
      repo._db.collection('versions').findOne(query, (err, createdResource) => {
        t.error(err)
        t.match(createdResource, resource)
        t.end()
      })
    })
  })

  t.test('should return a conflict error when the resource is a duplicate', (t) => {
    const resource = common.generatePatient()

    repo._db.collection('resources').insertOne(resource, (err) => {
      t.error(err)

      repo.createResource(resource, (err, returnedResource) => {
        t.type(err, ConflictError)
        t.equal(err.message, `Patient with id ${resource.id} already exists`)
        t.end()
      })
    })
  })

  t.end()
}))
